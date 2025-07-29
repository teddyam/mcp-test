import { ChatPrompt } from '@microsoft/teams.ai';
import { App } from '@microsoft/teams.apps';
import { ConsoleLogger } from '@microsoft/teams.common/logging';
import { DevtoolsPlugin } from '@microsoft/teams.dev';
import { McpClientPlugin } from '@microsoft/teams.mcpclient';
import { OpenAIChatModel } from '@microsoft/teams.openai';

const logger = new ConsoleLogger('mcp-client', { level: 'debug' });

const prompt = new ChatPrompt({
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
    url: 'https://learn.microsoft.com/api/mcp',
  });

const app = new App({
  plugins: [
    new DevtoolsPlugin()
  ]
});

app.on('message', async ({ send, activity }) => {
  await send({ type: 'typing' });
  const res = await prompt.send(activity.text);
  console.log(res);

  await send({ type: 'message', text: res.content });
});

(async () => {
  await app.start();
})();
