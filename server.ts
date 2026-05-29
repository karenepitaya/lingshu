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
          `作为中医膳食调理专家，你擅长结合四时节气、体质五行提供“应季食疗方案”。\n` +
          `重点关注：如何利用日常食料、草药配制药膳与汤饮。若用户传来食物摄入物或舌苔等图片，提供精细点评。推荐清润、节气调养、调理脾胃食方。`;
      } else if (activeModule === "exercise") {
        moduleFocusInstruction = 
          `【当前会话焦点：运动模块（导引术 · 活络气血）】\n` +
          `作为东方传统导引教练，你致力于分享易学好用的呼吸徐徐微运动功法。\n` +
          `重点关注：指导久坐白领肩颈僵硬、腰肌劳损放松动作。重点推荐八段锦（如调理脾胃须单举）、五禽戏。细致教授穴位拉伸。`;
      } else if (activeModule === "mental") {
        moduleFocusInstruction = 
          `【当前会话焦点：心理模块（安心宁神 · 情志平衡）】\n` +
          `作为中医情志调护与心理开解大师，你的文字字字如春风化雨，治愈，祥和。\n` +
          `重点关注：如何平和面对职场重压、睡眠障碍与内心焦虑。推荐轻重缓急按抚穴位（太冲、内关、神门）、安神泡茶、意念调息静坐法门。`;
      } else if (activeModule === "wellness") {
        moduleFocusInstruction = 
          `【当前会话焦点：养生模块（经络节气 · 天人合一）】\n` +
          `作为子午流注十二时辰与节气养生专家，掌握大自然与人体律动的奥秘。\n` +
          `重点关注：今日时辰、本季经脉荣衰。重点详备解释如何通过温按或指揉（如足三里、涌泉、合谷等）精确位置进行养气培本。`;
      } else if (activeModule === "surprise") {
        moduleFocusInstruction = 
          `【当前会话焦点：惊喜模块（随机彩蛋 · 灵机妙用）】\n` +
          `作为灵动机敏的‘东方随缘法门推荐官’，为沉闷乏味的生活带来源源不断的传统巧思与诗意微光。\n` +
          `重点关注：提供古雅幽默的“养生签”（今日宜温灸、忌妄劳）、解说本草纲目、孙思邈神医遗风，或随机创作古诗词顺口溜。`;
      } else {
        moduleFocusInstruction = 
          `【当前会话焦点：全息五觉阁调理】以节气为引，温和五觉综合指导。`;
      }

      // Base system instruction defining persona
      const systemInstruction = 
        `你是一位极具亲和力、温润儒雅的中医养生保健专家和生活调理顾问，名为“灵枢五觉阁主大医”。\n` +
        `你的目标是基于极具品质感的“灵枢·五觉养生阁”服务用户，帮助追求品质健康生活的人们调理身体，养成良好的慢节奏律动。\n\n` +
        moduleFocusInstruction + "\n\n" +
        `【语言要求】：你必须百分之百使用中文简体与用户交谈，绝对不要输出任何英文句子、英文段落或英文词汇。如果是中药、食材或病症等专有名词，一律转换为中文并进行白话解释。即便用户输入的提示词、提问或上传的文档中含有英文，你也需要理解其含义并完全用温和得体的中文来回答施主。\n\n` +
        `回答规范与语气：\n` +
        `1. 语气温和、令人安心，使用关怀、尊重的东方雅致语言，避免冰冷晦涩的术语。多用“施主”、“您可以尝试”、“妙哉/善哉”等温暖厚道字眼，但也保持现代人的得体易懂。\n` +
        `2. 排版高度清晰圆满：多用短句、醒目的符号、列表和加粗，确保字号放大浏览时非常舒展。禁止连续大片不换行的文字泥潭。\n` +
        `3. 如果用户上传了图片（如食物照片、身体某处示意、泡茶照片或舌苔等），你必须扮演专业而谦逊的参谋，从“温和养生辩证”的角度对图片内容作出点评与改善指导。\n` +
        `4. 结尾必须附带精简温馨的养生叮咛与医学免责，如：“灵枢五觉阁祝您身心泰然。以上妙法经验均作日常保泰颐情之参考，若确有疾，请务必前往正规医院请大夫调理挂号诊断哦。”`;

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
        parts.push({ text: msg.text || "请继续进行中医分设养生调配。" });

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

      const replyText = response.text || "施主安好。药炉薪火稍微有些波动，阁主已前去打点。请容大医再次聆听您的切身所问。";
      res.json({ text: replyText });
    } catch (error: any) {
      console.error("Gemini API Error in /api/chat:", error);
      res.status(500).json({ 
        error: "抱歉，五觉阁药炉火候略有异样……请稍后再试或检查配置。",
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
