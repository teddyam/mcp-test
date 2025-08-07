import { ChatPrompt } from '@microsoft/teams.ai';
import { OpenAIChatModel } from '@microsoft/teams.openai';
import { McpClientPlugin } from '@microsoft/teams.mcpclient';
import { ConsoleLogger } from '@microsoft/teams.common/logging';

const logger = new ConsoleLogger('mcp-client', { level: 'debug' });

const generatePromptInstructions = (mcpServerName: string) => { 
  return `You are a MCP Agent that is tied to the ${mcpServerName} MCP server. Your main purpose is to call on tools available from the MCP server. For ANY query related to ${mcpServerName}, use the tools to the best of your ability to answer.`
}

export const createMCPAgent = (mcpServerName: string, mcpServerLink: string) => {
  const prompt = new ChatPrompt({
    instructions: generatePromptInstructions(mcpServerName),
    model: new OpenAIChatModel({
      model: process.env.AOAI_MODEL!,
      apiKey: process.env.AOAI_API_KEY!,
      endpoint: process.env.AOAI_ENDPOINT!,
      apiVersion: '2025-04-01-preview'
    },
    ), logger,
  }, [new McpClientPlugin({ logger })],
  )
    .usePlugin('mcpClient', {
      url: mcpServerLink,
    });

  return prompt;
}