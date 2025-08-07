import { App } from '@microsoft/teams.apps';
import { DevtoolsPlugin } from '@microsoft/teams.dev';
import { createMCPAgent } from './prompt';
import { ChatPrompt } from '@microsoft/teams.ai';
import { OpenAIChatModel } from '@microsoft/teams.openai';
import { McpClientPlugin } from '@microsoft/teams.mcpclient';

// const prompt = createMCPAgent('Microsoft Learn', 'https://learn.microsoft.com/api/mcp');

const app = new App({
  plugins: [
    new DevtoolsPlugin()
  ],
  oauth: {
    defaultConnectionName: 'github-oauth'
  }
});

app.on('message', async ({ send, activity, signin, signout, next, log, ...rest }) => {
  // await send({ type: 'typing' });
  // const res = await prompt.send(activity.text);
  // console.log(res);

  // await send({ type: 'message', text: res.content });

  log.info('Received message:', activity.text);
  log.info('Other data:', rest['other_data']);
  const userToken = await signin();
  if (!userToken) {
    log.error('User token is not available. Please sign in first.');
    return;
  } else {
    log.info('User token is available:', userToken);
  }

  const chatPrompt = new ChatPrompt({
    instructions: 'You are a helpful assistant.',
    model: new OpenAIChatModel({
      model: process.env.AOAI_MODEL!,
      apiKey: process.env.AOAI_API_KEY!,
      endpoint: process.env.AOAI_ENDPOINT!,
      apiVersion: '2025-04-01-preview'
    }),
  }, [new McpClientPlugin()]).usePlugin('mcpClient', {
    url: 'https://api.githubcopilot.com/mcp/',
    params: {
      headers: {
        "Authorization": `Bearer ${userToken}`
      }
    }
  })

  const result = await chatPrompt.send(activity.text);
  console.log('Response from the model:', result.content);
  if (result?.content) {
    await send(result.content);
  } else {
    await send('No response from the model.');
  }
});

// app.event('signin', async ({ send })) => { 
//   await send('You are successfully signed in');
// }

(async () => {
  await app.start();
})();
