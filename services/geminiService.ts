import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { ChatMessage, Problem, AISummary, PhotoQuality, AIPersonality, AIVerbosity } from '../types.ts';

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = 'gemini-2.5-flash';

export const getSystemInstruction = (
  problems: Problem[] | null,
  personality: AIPersonality,
  verbosity: AIVerbosity
): string => {
  let personalityInstruction = '';
  switch (personality) {
    case 'playful':
      personalityInstruction = '你的沟通风格是俏皮可爱的，多使用一些友好的语气和表情符号，让对话轻松愉快。';
      break;
    case 'enthusiastic':
      personalityInstruction = '你的沟通风格是热情话痨，积极主动，充满正能量，乐于分享大量相关信息。';
      break;
    case 'serious':
    default:
      personalityInstruction = '你的沟通风格是严肃认真的，使用专业、中立、科学的语调。';
      break;
  }

  let verbosityInstruction = '';
  switch (verbosity) {
    case 'concise':
      verbosityInstruction = '你的回答需要言简意赅，直击要点，避免不必要的细节。';
      break;
    case 'medical':
      verbosityInstruction = '你的回答需要非常严谨，可以适当使用医学术语（并做简单解释），确保信息的准确性。';
      break;
    case 'detailed':
    default:
      verbosityInstruction = '你的回答需要深入浅出，既详细又易于理解，全面地解释相关概念。';
      break;
  }

  const problemText = problems && problems.length > 0
    ? `用户对以下问题表示关切：${problems.map(p => p.name).join('、')}。`
    : '你将与用户进行一场关于医美知识的自由对话。';

  return `你是一位专业、有同理心且谨慎的医美咨询 AI 助手。
${personalityInstruction}
${verbosityInstruction}
你的角色是仅提供信息支持。你绝对不能提供医疗诊断或制定明确的治疗方案。
${problemText}
在对话的任何时候，如果被问到诊所、医生、价格或品牌，请回答：“作为一个AI模型，我无法提供具体的商业信息，但您可以咨询专业的医美顾问来了解详情。”
在结束互动时，你必须强烈建议用户与合格的医生进行面对面咨询，以获取任何真实的医疗建议或治疗。
请保持你的回答有用、清晰且结构化。`;
};

export const startChat = (
  problems: Problem[] | null,
  personality: AIPersonality,
  verbosity: AIVerbosity
): Chat => {
  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: getSystemInstruction(problems, personality, verbosity),
    },
  });
  return chat;
};

export const sendMessageStream = async (chat: Chat, message: string) => {
  return chat.sendMessageStream({ message });
};

export const extractKeywords = async (articleContent: string): Promise<string[]> => {
    if (!API_KEY) {
        return Promise.resolve([]);
    }
    const prompt = `从以下这篇关于医疗美容的文章中，提取出10个最重要、最值得用户了解的核心关键词或专业术语。
要点：
1.  只选择最关键的词语。
2.  关键词应该是名词或技术术语，例如“玻尿酸”，“热玛吉”，“光子嫩肤”，“胶原蛋白流失”。
3.  返回一个JSON数组，其中只包含字符串，不要有其他解释。

文章内容：
---
${articleContent.substring(0, 3000)}
---

例如: ["玻尿酸", "肉毒素", "光子嫩肤", "热玛吉", "黄金微针", "填充剂", "胶原蛋白", "抗衰", "皮肤屏障", "敏感肌"]
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        const jsonText = response.text.trim();
        const keywords = JSON.parse(jsonText);
        // Filter out very short keywords that might not be useful
        return Array.isArray(keywords) ? keywords.filter(kw => kw.length > 1) : [];
    } catch (error) {
        console.error("Error extracting keywords:", error);
        return [];
    }
};

export const explainKeyword = async (keyword: string): Promise<string> => {
    if (!API_KEY) {
        return Promise.resolve(`这是一个关于"${keyword}"的模拟解释。在实际应用中，这里会由 AI 提供一个详细、通俗易懂的说明。`);
    }
    const prompt = `请用通俗易懂的中文，为一位对医疗美容感兴趣的普通用户解释一下术语：“${keyword}”。解释需要做到：
1.  **简洁清晰**：用1-3句话概括核心概念。
2.  **说人话**：避免使用过多复杂的专业词汇，多用比喻。
3.  **点明用途**：说明它在医美领域通常用来解决什么问题。

返回纯文本解释，不要添加任何 Markdown 格式或标题。`;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error explaining keyword:", error);
        return `抱歉，解释“${keyword}”时发生错误。请稍后重试。`;
    }
};


export const generateSuggestedQuestions = async (chatHistory: ChatMessage[]): Promise<string[]> => {
    if (!API_KEY) return ['预算大概是多少？', '你对恢复期有什么要求？', '之前做过类似的医美项目吗？'];

    const context = chatHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
    const prompt = `根据以下对话上下文，为用户生成3个最有可能追问的相关医美问题。问题要简洁、多样化、具有启发性。请直接返回一个JSON数组，包含三个字符串问题，不要包含任何markdown或其他文本。
    
    对话上下文:
    ${context}
    
    例如: ["玻尿酸和肉毒素有什么区别？", "射频治疗后多久能看到效果？", "如何判断我是否适合做光子嫩肤？"]`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        const jsonText = response.text.trim();
        const questions = JSON.parse(jsonText);
        return Array.isArray(questions) && questions.length > 0 ? questions : ['项目价格是多少？', '效果能维持多久？', '有什么副作用？'];
    } catch (error) {
        console.error("Error generating suggested questions:", error);
        return ['项目价格是多少？', '效果能维持多久？', '有什么副作用？']; // Fallback questions
    }
};

// --- Existing functions below, unchanged ---

export const validatePhoto = async (base64Image: string, mimeType: string): Promise<PhotoQuality> => {
    if (!API_KEY) {
        console.log("No API key, returning mock validation.");
        return new Promise(resolve => setTimeout(() => resolve({ passed: true, message: "质量检测通过（模拟）" }), 1000));
    }

    try {
        const imagePart = {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        };

        const prompt = `你是一个图片审查员。请分析这张图片，并以JSON格式返回审查结果。
1.  **内容安全**: 检查图片是否包含非法、色情、暴力、政治敏感或其他不当内容。如果是，则图片无效。
2.  **可用性**: 这是一张用于医疗美容咨询的面部照片。检查它是否符合以下标准：
    *   光线充足，面部清晰可见。
    *   没有遮挡物（如太阳镜、口罩、夸张的滤镜）。
    *   是用户的真实面部照片，而非卡通、动物或风景。
    *   照片清晰，没有严重模糊。
如果上述任何一点不满足，则图片无效。

请返回一个JSON对象，不要包含任何markdown格式。该对象必须包含两个字段：
- "passed": 布尔值，true表示图片有效，false表示无效。
- "message": 字符串，如果图片无效，请用中文简要说明原因。如果有效，则返回“图片质量符合要求”。`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model, 
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        passed: { type: Type.BOOLEAN },
                        message: { type: Type.STRING },
                    },
                    required: ["passed", "message"],
                },
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PhotoQuality;

    } catch (error) {
        console.error("Error validating photo:", error);
        return {
            passed: false,
            message: "图片审查时发生错误，请稍后重试或更换图片。",
        };
    }
};


export const generateFinalSummary = async (chatHistory: ChatMessage[]): Promise<AISummary | null> => {
  if (!API_KEY) {
      console.log("No API key, returning mock summary.");
      return {
          redFlags: ["用户目前正在服用光敏性药物（示例）。"],
          suggestedProjectCards: ["玻尿酸填充", "射频紧致"],
          nextSteps: ["咨询皮肤科医生以评估皮肤类型和敏感度。", "与合格的注射医生讨论玻尿酸填充剂方案及禁忌症。"]
      };
  }

  const summaryPrompt = `请根据提供的完整对话历史，生成最终的咨询摘要。
  分析用户的提问、回答和顾虑，以确定关键点。
  摘要必须是 JSON 格式。不要包含任何 markdown 格式，如 \`\`\`json。
  JSON 对象必须包含三个键：
  1.  "redFlags": 字符串数组，列出对话中提到或暗示的潜在禁忌症或关键警告（例如，“用户提到怀孕”，“用户有蟹足肿病史”）。如果没有，则返回空数组。
  2.  "suggestedProjectCards": 字符串数组，包含 2-3 个用户应该进一步了解的相关医美项目或概念的名称（例如，“玻尿酸填充”，“射频紧致”，“肉毒素”）。
  3.  "nextSteps": 字符串数组，概述用户的具体后续步骤，并始终强调专业咨询（例如，“预约皮肤科医生进行皮肤状况评估”，“与认证的医美医生讨论填充剂方案”）。
  
  对话历史：
  ${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: summaryPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedProjectCards: { type: Type.ARRAY, items: { type: Type.STRING } },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["redFlags", "suggestedProjectCards", "nextSteps"],
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AISummary;
  } catch (error) {
    console.error("Error generating final summary:", error);
    // Fallback to a default/error summary
    return {
      redFlags: ["生成摘要时出错。请手动查看聊天记录。"],
      suggestedProjectCards: [],
      nextSteps: ["需要专业咨询才能获得准确的建议。"],
    };
  }
};