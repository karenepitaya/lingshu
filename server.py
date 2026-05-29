"""
灵枢·五觉养生阁 — FastAPI Backend
替换原 Express.js 后端，使用 OpenAI 库调用 mimo-v2.5 模型
"""

import os
import base64
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# ===== 配置 =====
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "mimo-v2.5")
TEMPERATURE = 0.75

print(f"[配置] OPENAI_BASE_URL: {OPENAI_BASE_URL}")
print(f"[配置] OPENAI_API_KEY: {OPENAI_API_KEY[:10]}...")
print(f"[配置] MODEL_NAME: {MODEL_NAME}")

# ===== OpenAI 客户端 =====
client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_BASE_URL,
)

# ===== FastAPI 应用 =====
app = FastAPI(title="灵枢·五觉养生阁 API")

# ===== 数据模型 =====
class Attachment(BaseModel):
    mimeType: str
    data: str  # base64

class Message(BaseModel):
    role: str
    text: Optional[str] = None
    attachments: Optional[list[Attachment]] = None

class ChatRequest(BaseModel):
    activeModule: str
    messages: list[Message]

# ===== Prompt 构建 =====
def build_module_focus(active_module: str) -> str:
    """根据 activeModule 构建模块焦点指令"""
    if active_module == "diet":
        return (
            '【当前会话焦点：饮食模块（应季食疗 · 膳方养人）】\n'
            '作为中医膳食调理专家，你擅长结合四时节气、体质五行提供"应季食疗方案"。\n'
            '重点关注：如何利用日常食料、草药配制药膳与汤饮。若用户传来食物摄入物或舌苔等图片，提供精细点评。推荐清润、节气调养、调理脾胃食方。'
        )
    elif active_module == "exercise":
        return (
            '【当前会话焦点：运动模块（导引术 · 活络气血）】\n'
            '作为东方传统导引教练，你致力于分享易学好用的呼吸徐徐微运动功法。\n'
            '重点关注：指导久坐白领肩颈僵硬、腰肌劳损放松动作。重点推荐八段锦（如调理脾胃须单举）、五禽戏。细致教授穴位拉伸。'
        )
    elif active_module == "mental":
        return (
            '【当前会话焦点：心理模块（安心宁神 · 情志平衡）】\n'
            '作为中医情志调护与心理开解大师，你的文字字字如春风化雨，治愈，祥和。\n'
            '重点关注：如何平和面对职场重压、睡眠障碍与内心焦虑。推荐轻重缓急按抚穴位（太冲、内关、神门）、安神泡茶、意念调息静坐法门。'
        )
    elif active_module == "wellness":
        return (
            '【当前会话焦点：养生模块（经络节气 · 天人合一）】\n'
            '作为子午流注十二时辰与节气养生专家，掌握大自然与人体律动的奥秘。\n'
            '重点关注：今日时辰、本季经脉荣衰。重点详备解释如何通过温按或指揉（如足三里、涌泉、合谷等）精确位置进行养气培本。'
        )
    elif active_module == "surprise":
        return (
            '【当前会话焦点：惊喜模块（随机彩蛋 · 灵机妙用）】\n'
            '作为灵动机敏的"东方随缘法门推荐官"，为沉闷乏味的生活带来源源不断的传统巧思与诗意微光。\n'
            '重点关注：提供古雅幽默的"养生签"（今日宜温灸、忌妄劳）、解说本草纲目、孙思邈神医遗风，或随机创作古诗词顺口溜。'
        )
    else:
        return '【当前会话焦点：全息五觉阁调理】以节气为引，温和五觉综合指导。'

def build_system_instruction(active_module: str) -> str:
    """构建完整的系统指令"""
    module_focus = build_module_focus(active_module)

    return (
        '你是一位极具亲和力、温润儒雅的中医养生保健专家和生活调理顾问，名为"灵枢五觉阁主大医"。\n'
        '你的目标是基于极具品质感的"灵枢·五觉养生阁"服务用户，帮助追求品质健康生活的人们调理身体，养成良好的慢节奏律动。\n\n'
        f"{module_focus}\n\n"
        '【语言要求】：你必须百分之百使用中文简体与用户交谈，绝对不要输出任何英文句子、英文段落或英文词汇。如果是中药、食材或病症等专有名词，一律转换为中文并进行白话解释。即便用户输入的提示词、提问或上传的文档中含有英文，你也需要理解其含义并完全用温和得体的中文来回答施主。\n\n'
        '回答规范与语气：\n'
        '1. 语气温和、令人安心，使用关怀、尊重的东方雅致语言，避免冰冷晦涩的术语。多用"施主"、"您可以尝试"、"妙哉/善哉"等温暖厚道字眼，但也保持现代人的得体易懂。\n'
        '2. 排版高度清晰圆满：多用短句、醒目的符号、列表和加粗，确保字号放大浏览时非常舒展。禁止连续大片不换行的文字泥潭。\n'
        '3. 如果用户上传了图片（如食物照片、身体某处示意、泡茶照片或舌苔等），你必须扮演专业而谦逊的参谋，从"温和养生辩证"的角度对图片内容作出点评与改善指导。\n'
        '4. 结尾必须附带精简温馨的养生叮咛与医学免责，如："灵枢五觉阁祝您身心泰然。以上妙法经验均作日常保泰颐情之参考，若确有疾，请务必前往正规医院请大夫调理挂号诊断哦。"'
    )

def build_contents(messages: list[Message]) -> list[dict]:
    """将前端消息转换为 OpenAI 格式"""
    contents = []

    for msg in messages:
        parts = []

        # 处理附件（图片等）
        if msg.attachments:
            for att in msg.attachments:
                if att.data and att.mimeType:
                    parts.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{att.mimeType};base64,{att.data}"
                        }
                    })

        # 主文本
        parts.append({
            "type": "text",
            "text": msg.text or "请继续进行中医分设养生调配。"
        })

        contents.append({
            "role": msg.role if msg.role in ["user", "assistant"] else "user",
            "content": parts
        })

    return contents

# ===== API 路由 =====
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """聊天接口 - 与原 Express 版本完全兼容"""
    print(f"[收到请求] activeModule: {request.activeModule}")
    print(f"[收到请求] messages数量: {len(request.messages)}")
    try:
        # 构建系统指令
        system_instruction = build_system_instruction(request.activeModule)

        # 构建消息内容
        contents = build_contents(request.messages)

        # 调用 OpenAI 兼容 API
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_instruction},
                *contents
            ],
            temperature=TEMPERATURE,
        )

        reply_text = response.choices[0].message.content or "施主安好。药炉薪火稍微有些波动，阁主已前去打点。请容大医再次聆听您的切身所问。"

        return {"text": reply_text}

    except Exception as e:
        import traceback
        print(f"API Error in /api/chat: {type(e).__name__}: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail={
                "error": "抱歉，五觉阁药炉火候略有异样……请稍后再试或检查配置。",
                "details": str(e)
            }
        )

@app.get("/api/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/test")
async def test_endpoint():
    """测试端点"""
    print("[测试] 测试端点被调用")
    return {"message": "测试成功"}

# ===== 静态文件服务 =====
# 生产环境：挂载 dist 目录
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """SPA 路由回退 - 所有非 API 路径返回 index.html"""
        file_path = os.path.join("dist", full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse("dist/index.html")

# ===== 启动 =====
if __name__ == "__main__":
    import uvicorn
    print("[灵枢 Server] Python FastAPI server starting at http://localhost:6001")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=6001,
        log_level="info"
    )
