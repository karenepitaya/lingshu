"""
灵枢·五觉养生阁 — FastAPI Backend
替换原 Express.js 后端，使用 OpenAI 库调用 mimo-v2.5 模型
"""

import os
import json
import base64
import uuid
import oss2
import requests as http_requests
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

PUBLIC_URL = os.getenv("PUBLIC_URL", "http://localhost:6001")

# 阿里云 OSS 配置（用于 Coze chatflow 图片传入）
OSS_ACCESS_KEY_ID = os.getenv("OSS_ACCESS_KEY_ID", "")
OSS_ACCESS_KEY_SECRET = os.getenv("OSS_ACCESS_KEY_SECRET", "")
OSS_BUCKET_NAME = os.getenv("OSS_BUCKET_NAME", "")
OSS_ENDPOINT = os.getenv("OSS_ENDPOINT", "")
OSS_PUBLIC_URL = os.getenv("OSS_PUBLIC_URL", "")

print(f"[配置] OPENAI_BASE_URL: {OPENAI_BASE_URL}")
print(f"[配置] OPENAI_API_KEY: {OPENAI_API_KEY[:10]}...")
print(f"[配置] MODEL_NAME: {MODEL_NAME}")
print(f"[配置] OSS_BUCKET: {OSS_BUCKET_NAME}")

# ===== OpenAI 客户端 =====
client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_BASE_URL,
)

# ===== Coze 工作流配置 =====
COZE_BASE_URL = os.getenv("COZE_BASE_URL", "https://api.coze.cn")
COZE_WORKFLOWS = {
    "diet": {
        "id": os.getenv("COZE_DIET_WORKFLOW_ID", ""),
        "token": os.getenv("COZE_DIET_TOKEN", ""),
        "type": "workflow",
        "param_key": "input",
    },
    "exercise": {
        "id": os.getenv("COZE_EXERCISE_WORKFLOW_ID", ""),
        "token": os.getenv("COZE_EXERCISE_TOKEN", ""),
        "type": "workflow",
        "param_key": "input",
    },
    "mental": {
        "id": os.getenv("COZE_MENTAL_WORKFLOW_ID", ""),
        "token": os.getenv("COZE_MENTAL_TOKEN", ""),
        "type": "workflow",
        "param_key": "input",
    },
    "wellness": {
        "id": os.getenv("COZE_WELLNESS_WORKFLOW_ID", ""),
        "token": os.getenv("COZE_WELLNESS_TOKEN", ""),
        "type": "workflow",
        "param_key": "user_input",
    },
    "surprise": {
        "id": os.getenv("COZE_SURPRISE_WORKFLOW_ID", ""),
        "token": os.getenv("COZE_SURPRISE_TOKEN", ""),
        "type": "workflow",
        "param_key": "input",
        "chatflow_id": os.getenv("COZE_SURPRISE_CHATFLOW_ID", ""),
        "chatflow_token": os.getenv("COZE_SURPRISE_CHATFLOW_TOKEN", ""),
    },
}

print(f"[配置] COZE_BASE_URL: {COZE_BASE_URL}")
for mod, cfg in COZE_WORKFLOWS.items():
    wf_id = cfg['id'][:8] if cfg['id'] else '(empty)'
    cf_id = cfg.get('chatflow_id', '')[:8] if cfg.get('chatflow_id') else '-'
    print(f"[配置] Coze {mod}: workflow_id={wf_id}..., chatflow_id={cf_id}")

# 初始化 OSS 客户端
_oss_bucket = None
if OSS_ACCESS_KEY_ID and OSS_ACCESS_KEY_SECRET and OSS_BUCKET_NAME and OSS_ENDPOINT:
    try:
        _auth = oss2.Auth(OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET)
        _oss_bucket = oss2.Bucket(_auth, OSS_ENDPOINT, OSS_BUCKET_NAME)
        print(f"[配置] OSS 客户端初始化成功: {OSS_BUCKET_NAME}")
    except Exception as e:
        print(f"[配置] OSS 客户端初始化失败: {e}")


def upload_image_to_oss(base64_data: str, mime_type: str) -> str:
    """将 base64 图片上传到阿里云 OSS，返回公网 URL"""
    if not _oss_bucket:
        raise RuntimeError("OSS 客户端未初始化")

    ext = mime_type.split("/")[-1].split(";")[0]
    if ext not in ("png", "jpg", "jpeg", "gif", "webp"):
        ext = "png"
    filename = f"coze-images/{uuid.uuid4().hex}.{ext}"
    img_bytes = base64.b64decode(base64_data)

    _oss_bucket.put_object(filename, img_bytes)
    url = f"{OSS_PUBLIC_URL}/{filename}"
    print(f"[OSS] 上传成功: {url}")
    return url


def call_coze_workflow(module: str, user_input: str, image_url: str = "") -> Optional[str]:
    """调用 Coze 工作流，返回结果文本。失败返回 None。"""
    import time
    cfg = COZE_WORKFLOWS.get(module)
    if not cfg or not cfg["id"] or not cfg["token"]:
        print(f"[Coze] {module} 配置不完整，跳过")
        return None

    headers = {
        "Authorization": f"Bearer {cfg['token']}",
        "Content-Type": "application/json",
    }
    t0 = time.time()

    if cfg["type"] == "chatflow":
        # chatflow 使用 /v1/workflows/chat 端点
        url = f"{COZE_BASE_URL}/v1/workflows/chat"
        payload = {
            "workflow_id": cfg["id"],
            "parameters": {
                "CONVERSATION_NAME": "Default",
                cfg["param_key"]: user_input,
                "user_image": image_url,
            },
            "additional_messages": [
                {
                    "content": user_input,
                    "content_type": "text",
                    "role": "user",
                    "type": "question",
                }
            ],
        }
    else:
        # workflow 使用 /v1/workflow/stream_run 端点
        url = f"{COZE_BASE_URL}/v1/workflow/stream_run"
        payload = {
            "workflow_id": cfg["id"],
            "parameters": {
                cfg["param_key"]: user_input,
            },
        }

    try:
        resp = http_requests.post(url, headers=headers, json=payload, stream=True, timeout=60)
        t1 = time.time()
        print(f"[Coze] {module} 连接耗时: {t1-t0:.1f}s, 状态: {resp.status_code}")
        resp.raise_for_status()

        # 解析 SSE 流，提取最终输出
        # Workflow SSE 事件格式：
        #   - node_type="Message": 包含实际回复内容 (content 字段)
        #   - node_type="End": 工作流结束标记，content 为空
        #   - 仅有 debug_url: 调试信息，忽略
        # Chatflow SSE 事件格式：
        #   - role="assistant", type="answer": 包含实际回复内容 (content 字段)
        #   - status="completed": 聊天结束
        #   - 仅有 debug_url: 调试信息，忽略
        output = ""
        for line in resp.iter_lines(decode_unicode=True):
            if not line or not line.startswith("data:"):
                continue
            data_str = line[5:].strip()
            if not data_str or data_str == "[DONE]":
                break
            try:
                event = json.loads(data_str)
                content = event.get("content", "")
                node_type = event.get("node_type", "")
                role = event.get("role", "")
                msg_type = event.get("type", "")

                # Workflow: 取有内容的事件（Message 或 End 节点都可能携带内容）
                if content and not role:
                    output = content
                # Chatflow: 取 assistant 的 answer 类型消息
                elif role == "assistant" and msg_type == "answer" and content:
                    output = content
            except json.JSONDecodeError:
                continue

        t2 = time.time()

        # 尝试解析 JSON 输出（某些工作流返回 {"output": "..."} 格式）
        if output:
            try:
                parsed = json.loads(output)
                if isinstance(parsed, dict) and "output" in parsed:
                    output = parsed["output"]
            except json.JSONDecodeError:
                pass  # 不是 JSON，直接使用原文

        print(f"[Coze] {module} 总耗时: {t2-t0:.1f}s, 输出长度: {len(output)}字")
        return output if output else None

    except Exception as e:
        if "timeout" in type(e).__name__.lower() or "Timeout" in str(e):
            print(f"[Coze] {module} 工作流超时(60s)，将回退到 LLM")
        else:
            print(f"[Coze] {module} 工作流调用失败: {type(e).__name__}: {e}")
        return None


def call_coze_chatflow(module: str, user_input: str, image_url: str) -> Optional[str]:
    """
    调用 Coze chatflow（两轮 SSE，支持 Interrupt/Resume）。
    用于需要图片输入的交互式工作流（如面部分析）。

    流程：
      第一轮 POST /v1/workflows/chat → Interrupt（选择卡片）+ conversation_id
      第二轮 POST /v1/workflows/chat → 携带 conversation_id + tool_outputs 续接 → 最终结果
    """
    import time

    cfg = COZE_WORKFLOWS.get(module)
    if not cfg:
        return None

    chatflow_id = cfg.get("chatflow_id") or cfg["id"]
    token = cfg.get("chatflow_token") or cfg["token"]

    if not chatflow_id or not token:
        print(f"[Chatflow] {module} 配置不完整，跳过")
        return None

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    t0 = time.time()

    # ── 第一轮：发起 chatflow ──
    payload_step1 = {
        "workflow_id": chatflow_id,
        "parameters": {
            "CONVERSATION_NAME": "Default",
            "USER_INPUT": user_input or "帮我分析一下",
            "user_image": image_url,
        },
        "additional_messages": [
            {
                "content": user_input or "帮我分析一下",
                "content_type": "text",
                "role": "user",
                "type": "question",
            }
        ],
    }

    try:
        print(f"[Chatflow] {module} 第一轮发起...")
        resp = http_requests.post(
            f"{COZE_BASE_URL}/v1/workflows/chat",
            headers=headers,
            json=payload_step1,
            stream=True,
            timeout=90,
        )
        resp.raise_for_status()

        answer_text = ""
        conversation_id = None
        has_interrupt = False

        for line in resp.iter_lines(decode_unicode=True):
            if not line or not line.startswith("data:"):
                continue
            data_str = line[5:].strip()
            if not data_str or data_str == "[DONE]":
                break
            try:
                event = json.loads(data_str)
            except json.JSONDecodeError:
                continue

            # 提取 conversation_id
            cid = event.get("conversation_id")
            if cid and not conversation_id:
                conversation_id = cid

            # 提取助手回复
            role = event.get("role", "")
            msg_type = event.get("type", "")
            content = event.get("content", "")

            if role == "assistant" and msg_type == "answer" and content:
                answer_text += content

            # 检测 Interrupt
            if msg_type == "verbose" and "interrupt" in content:
                has_interrupt = True
                print(f"[Chatflow] {module} 检测到 Interrupt")

        t1 = time.time()
        print(f"[Chatflow] {module} 第一轮耗时: {t1-t0:.1f}s, "
              f"conversation_id={conversation_id}, interrupt={has_interrupt}")

        # ── 检测到 Interrupt → 返回选择项，由用户决定 ──
        if has_interrupt and conversation_id:
            # 解析选择卡片中的选项（格式："- 选项名"）
            choices = []
            for line in answer_text.split("\n"):
                line = line.strip()
                if line.startswith("- "):
                    choices.append(line[2:].strip())

            t1 = time.time()
            print(f"[Chatflow] {module} 第一轮耗时: {t1-t0:.1f}s, "
                  f"Interrupt! 选项: {choices}")

            return {
                "chatflow_choices": choices or ["聊养生", "算运势"],
                "chatflow_conversation_id": conversation_id,
                "chatflow_text": answer_text,
            }

        total = time.time() - t0
        print(f"[Chatflow] {module} 总耗时: {total:.1f}s")
        return answer_text if answer_text else None

    except Exception as e:
        print(f"[Chatflow] {module} 调用失败: {type(e).__name__}: {e}")
        return None


def resume_coze_chatflow(module: str, conversation_id: str, user_choice: str) -> Optional[str]:
    """
    续接被 Interrupt 的 Coze chatflow。
    携带 conversation_id + tool_outputs 发送用户选择，获取最终结果。
    """
    import time

    cfg = COZE_WORKFLOWS.get(module)
    if not cfg:
        return None

    chatflow_id = cfg.get("chatflow_id") or cfg["id"]
    token = cfg.get("chatflow_token") or cfg["token"]

    if not chatflow_id or not token:
        return None

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    payload = {
        "workflow_id": chatflow_id,
        "conversation_id": conversation_id,
        "parameters": {
            "CONVERSATION_NAME": "Default",
            "USER_INPUT": user_choice,
        },
        "additional_messages": [
            {
                "content": user_choice,
                "content_type": "text",
                "role": "user",
                "type": "question",
            }
        ],
        "tool_outputs": [
            {
                "tool_call_id": "reply_message",
                "output": user_choice,
            }
        ],
    }

    t0 = time.time()
    try:
        print(f"[Chatflow] {module} 续接: choice='{user_choice}', conversation_id={conversation_id}")
        resp = http_requests.post(
            f"{COZE_BASE_URL}/v1/workflows/chat",
            headers=headers,
            json=payload,
            stream=True,
            timeout=120,
        )
        resp.raise_for_status()

        answer_text = ""
        for line in resp.iter_lines(decode_unicode=True):
            if not line or not line.startswith("data:"):
                continue
            data_str = line[5:].strip()
            if not data_str or data_str == "[DONE]":
                break
            try:
                event = json.loads(data_str)
            except json.JSONDecodeError:
                continue

            role = event.get("role", "")
            msg_type = event.get("type", "")
            content = event.get("content", "")

            if role == "assistant" and msg_type == "answer" and content:
                answer_text += content

        total = time.time() - t0
        print(f"[Chatflow] {module} 续接耗时: {total:.1f}s, 输出长度: {len(answer_text)}字")
        return answer_text if answer_text else None

    except Exception as e:
        print(f"[Chatflow] {module} 续接失败: {type(e).__name__}: {e}")
        return None


def check_relevance(question: str, answer: str) -> bool:
    """用 LLM 判断回答是否与问题相关。返回 True 表示相关。"""
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": '你是一个内容审核员。判断【回答】是否与【问题】相关且有意义。只回复"是"或"否"。'},
                {"role": "user", "content": f"【问题】{question}\n\n【回答】{answer[:500]}"},
            ],
            temperature=0.1,
            max_tokens=10,
        )
        result = (response.choices[0].message.content or "").strip()
        is_relevant = "是" in result
        print(f"[相关性检查] {'相关' if is_relevant else '不相关'}: {result}")
        return is_relevant
    except Exception as e:
        print(f"[相关性检查] 失败: {e}")
        return False  # 检查失败时默认不信任 Coze 结果



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
    chatflow_conversation_id: Optional[str] = None

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
        # 提取用户最新一条消息（文本 + 图片）
        user_latest = ""
        image_url = ""
        for msg in reversed(request.messages):
            if msg.role == "user":
                if msg.text:
                    user_latest = msg.text
                # 惊喜模块：将 base64 图片上传到 OSS 获取公网 URL
                if msg.attachments and request.activeModule == "surprise":
                    for att in msg.attachments:
                        if att.data and att.mimeType:
                            try:
                                image_url = upload_image_to_oss(att.data, att.mimeType)
                            except Exception as img_err:
                                print(f"[图片] OSS 上传失败: {img_err}")
                if user_latest:
                    break

        # 惊喜模块 chatflow 续接（用户点击了选择按钮）
        if request.chatflow_conversation_id and request.activeModule == "surprise":
            resume_result = resume_coze_chatflow(
                "surprise", request.chatflow_conversation_id, user_latest
            )
            if resume_result:
                return {"text": resume_result}
            print("[Chatflow] 续接失败，回退到普通流程")

        # 惊喜模块 + 图片 → 走 chatflow（面部分析，SSE Interrupt → 返回选择项）
        if request.activeModule == "surprise" and image_url:
            chatflow_result = call_coze_chatflow("surprise", user_latest, image_url)
            if isinstance(chatflow_result, dict):
                # Interrupt → 返回选择项给前端
                return chatflow_result
            if isinstance(chatflow_result, str) and chatflow_result:
                return {"text": chatflow_result}
            print("[Chatflow] 面部分析失败，回退到普通工作流")

        # 优先使用 Coze 工作流（60秒超时）
        coze_result = call_coze_workflow(request.activeModule, user_latest, image_url)

        # Coze 有回复时，检查相关性
        if coze_result:
            print(f"[Coze] {request.activeModule} 工作流返回，检查相关性...")
            if check_relevance(user_latest, coze_result):
                print(f"[Coze] {request.activeModule} 回复相关，放行")
                return {"text": coze_result}
            else:
                print(f"[Coze] {request.activeModule} 回复不相关，转交 LLM")

        # Coze 不可用或回复不相关时，回退到 LLM
        print(f"[回退] 使用 LLM ({request.activeModule})")
        system_instruction = build_system_instruction(request.activeModule)
        contents = build_contents(request.messages)

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_instruction},
                *contents
            ],
            temperature=TEMPERATURE,
        )

        reply_text = response.choices[0].message.content or "抱歉，回复出现了些问题。请再说一次您的问题，我重新为您解答。"

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


# ===== 动态灵感生成 =====
MODULE_META = {
    "diet": {
        "name": "健康食疗",
        "desc": "中医膳食调理，结合节气与体质推荐食方",
        "examples": [
            {"text": "这段时间适合喝什么汤调理脾胃呀？", "label": "调脾胃"},
            {"text": "想了解当季食材怎么搭配更健康", "label": "应季搭配"},
            {"text": "最近总熬夜，饮食上能怎么补救", "label": "熬夜补救"},
            {"text": "晚饭总是吃太多积食难消，有没有消食化积的小汤方？", "label": "消食解积"},
        ],
    },
    "exercise": {
        "name": "气血导引",
        "desc": "传统导引运动功法，缓解久坐疲劳",
        "examples": [
            {"text": "最近总对着电脑，脖子太僵了", "label": "肩颈不适"},
            {"text": "想学学八段锦的前三个动作", "label": "八段锦入门"},
            {"text": "有哪些坐着也能练的拉伸法", "label": "办公拉伸"},
            {"text": "一到下午就腰酸背痛，有什么简单的导引动作？", "label": "活经舒腰"},
        ],
    },
    "mental": {
        "name": "安心情志",
        "desc": "情志调理与心理疏导，平和身心",
        "examples": [
            {"text": "最近老是莫名烦躁，有什么调理方法", "label": "情绪调理"},
            {"text": "晚上睡不好总做梦，怎么能安神", "label": "安神助眠"},
            {"text": "上班太焦虑了，有没有快速平复的方法", "label": "快速减压"},
            {"text": "容易叹气、胸闷，有什么疏肝解郁的药茶推荐？", "label": "疏肝悦志"},
        ],
    },
    "wellness": {
        "name": "时辰穴位",
        "desc": "子午流注与节气养生，穴位保健",
        "examples": [
            {"text": "每天什么时间段养生效果最好", "label": "最佳时辰"},
            {"text": "秋冬换季怎么做才能不感冒", "label": "换季防护"},
            {"text": "想了解足三里穴具体怎么按揉", "label": "穴位按揉"},
            {"text": "手脚冰凉怕冷，艾灸哪些穴位最有效？", "label": "回阳暖肢"},
        ],
    },
    "surprise": {
        "name": "随缘妙用",
        "desc": "趣味养生知识与传统智慧小彩蛋",
        "examples": [
            {"text": "推荐一个意想不到的养生小窍门", "label": "养生窍门"},
            {"text": "有什么适合发朋友圈的养生金句", "label": "养生金句"},
            {"text": "分享一个名医的有趣养生故事", "label": "名医趣闻"},
            {"text": "给我摇一个今日养生签，宜什么忌什么？", "label": "养生随缘签"},
        ],
    },
}

@app.get("/api/inspirations/{module}")
async def get_inspirations(module: str):
    """为指定模块动态生成健康探讨话题建议"""
    meta = MODULE_META.get(module)
    if not meta:
        raise HTTPException(status_code=400, detail=f"Unknown module: {module}")

    # 构建 few-shot 提示词
    examples_text = "\n".join(
        f'  示例{i+1}: {{"text": "{ex["text"]}", "label": "{ex["label"]}"}}'
        for i, ex in enumerate(meta["examples"])
    )

    prompt = (
        f'你是"灵枢·五觉养生阁"的健康话题策划助手。\n'
        f'请为【{meta["name"]}】模块生成4个全新的健康探讨话题建议。\n\n'
        f'模块说明：{meta["desc"]}\n\n'
        f'要求：\n'
        f'1. 每个话题用自然口语化的中文，15-25字\n'
        f'2. 贴合当前季节与节气\n'
        f'3. 风格参考以下示例，但不要重复示例内容：\n'
        f'{examples_text}\n\n'
        f'4. label字段为2-4字的简短标签\n'
        f'5. 4个话题角度各异，覆盖不同场景\n\n'
        f'请严格返回JSON格式：\n'
        f'{{"suggestions": [{{"text": "话题内容", "label": "标签"}}, ...]}}'
    )

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "你是一个健康话题策划助手，只输出JSON。"},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)
        suggestions = parsed.get("suggestions", [])

        # 验证格式
        if not isinstance(suggestions, list) or len(suggestions) == 0:
            raise ValueError("Invalid suggestions format")

        # 确保每项有 text 和 label
        validated = []
        for item in suggestions[:4]:
            if isinstance(item, dict) and "text" in item:
                validated.append({
                    "text": str(item["text"]),
                    "label": str(item.get("label", "探讨")),
                })

        if len(validated) == 0:
            raise ValueError("No valid suggestions")

        # 不足 4 条时用硬编码补齐
        if len(validated) < 4:
            for ex in meta["examples"]:
                if len(validated) >= 4:
                    break
                if not any(v["text"] == ex["text"] for v in validated):
                    validated.append(ex)

        return {"suggestions": validated}

    except Exception as e:
        print(f"[灵感生成] 失败，使用默认值: {type(e).__name__}: {e}")
        # 失败时返回硬编码默认值
        return {"suggestions": meta["examples"][:4]}

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
