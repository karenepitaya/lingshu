import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser configurations
  app.use(express.json());

  // Setup Gemini SDK Client safely (lazy checked inside api route to prevent startup crash)
  let ai: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("WARNING: GEMINI_API_KEY is not set in environment variables.");
      }
      ai = new GoogleGenAI({
        apiKey: apiKey || "MOCK_KEY_IF_ABSENT",
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  }

  // API Endpoint for Wellness consulting
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, activeModule } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      const client = getGeminiClient();
      
      // Determine module description
      let moduleFocusInstruction = "";
      if (activeModule === "diet") {
        moduleFocusInstruction =
          `【当前会话焦点：饮食模块（应季食疗 · 膳方养人）】\n` +
          `作为中医膳食调理专家，你擅长结合节气、体质提供应季食疗方案。\n` +
          `重点关注：如何利用日常食材、草药配制药膳与茶饮。若用户传来食物或舌苔等图片，提供分析点评。推荐清润、节气调养、调理脾胃的食方。`;
      } else if (activeModule === "exercise") {
        moduleFocusInstruction =
          `【当前会话焦点：运动模块（导引术 · 活络气血）】\n` +
          `作为传统导引教练，你致力于分享易学好用的呼吸与运动功法。\n` +
          `重点关注：指导久坐人群的肩颈僵硬、腰肌劳损放松动作。推荐八段锦（如调理脾胃须单举）、五禽戏等。细致教授穴位拉伸。`;
      } else if (activeModule === "mental") {
        moduleFocusInstruction =
          `【当前会话焦点：心理模块（安心宁神 · 情志平衡）】\n` +
          `作为中医情志调理与心理疏导专家，你的文字温和治愈，令人安心。\n` +
          `重点关注：如何平和面对职场压力、睡眠障碍与焦虑情绪。推荐按抚穴位（太冲、内关、神门）、安神茶饮、呼吸调息静坐法。`;
      } else if (activeModule === "wellness") {
        moduleFocusInstruction =
          `【当前会话焦点：养生模块（经络节气 · 天人合一）】\n` +
          `作为子午流注十二时辰与节气养生专家，熟悉人体经络与自然节律的关系。\n` +
          `重点关注：当前时辰、本季经脉状态。详细解释如何通过按揉穴位（如足三里、涌泉、合谷等）进行日常保健。`;
      } else if (activeModule === "surprise") {
        moduleFocusInstruction =
          `【当前会话焦点：惊喜模块（随机彩蛋 · 灵机妙用）】\n` +
          `作为有趣的健康知识分享者，为生活增添传统养生的趣味与智慧。\n` +
          `重点关注：提供趣味”养生签”（今日宜温灸、忌过劳）、讲述本草纲目和古代名医的趣闻故事，或创作养生顺口溜。`;
      } else {
        moduleFocusInstruction = 
          `【当前会话焦点：全息五觉阁调理】以节气为引，温和五觉综合指导。`;
      }

      // Base system instruction defining persona
      const systemInstruction =
        `你是一位亲和力强、专业可靠的中医养生保健专家和健康调理顾问，服务于”灵枢·五觉养生阁”平台。\n` +
        `你的目标是帮助用户调理身体、养成健康的生活节奏，提供基于中医理论的实用养生建议。\n\n` +
        moduleFocusInstruction + "\n\n" +
        `【语言要求】：你必须百分之百使用中文简体与用户交谈，绝对不要输出任何英文句子、英文段落或英文词汇。如果是中药、食材或病症等专有名词，一律转换为中文并进行白话解释。即便用户输入的内容中含有英文，你也需要理解其含义并完全用温和得体的中文来回答。\n\n` +
        `回答规范与语气：\n` +
        `1. 语气温和、令人安心，使用关怀、尊重的语言，避免冰冷晦涩的术语。称呼用户为”您”，可以用”不妨试试”、”建议”等温和字眼，保持专业又亲切。\n` +
        `2. 排版清晰易读：多用短句、列表和加粗，确保字号放大时浏览舒适。避免大段不换行的文字。\n` +
        `3. 如果用户上传了图片（如食物照片、身体部位示意、泡茶照片或舌苔等），请从中医养生的角度对图片内容作出分析与改善建议。\n` +
        `4. 结尾附带简短的健康提醒与医学免责，如：”以上建议仅供参考，若有身体不适，请前往正规医院就诊。祝您健康！”`;

      // Transform frontend message list into Gemini expected Content format
      const contents = messages.map(msg => {
        const parts: any[] = [];
        
        // Attachment pieces
        if (msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0) {
          for (const att of msg.attachments) {
            if (att.data && att.mimeType) {
              parts.push({
                inlineData: {
                  mimeType: att.mimeType,
                  data: att.data
                }
              });
            }
          }
        }

        // Main text piece
        parts.push({ text: msg.text || "请继续讨论养生健康话题。" });

        return {
          role: msg.role === "user" ? "user" : "model",
          parts: parts
        };
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.75,
        }
      });

      const replyText = response.text || "抱歉，回复出现了些问题。请再说一次您的问题，我重新为您解答。";
      res.json({ text: replyText });
    } catch (error: any) {
      console.error("Gemini API Error in /api/chat:", error);
      res.status(500).json({ 
        error: "抱歉，服务出现了些问题，请稍后再试。",
        details: error?.message || "" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Vite middleware setup based on environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[颐养 Server] Full-stack server in action at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical error starting Express back-end:", err);
});
