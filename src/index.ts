import { App } from '@microsoft/teams.apps';
import { DevtoolsPlugin } from '@microsoft/teams.dev';
import { createMCPAgent } from './prompt';

const prompt = createMCPAgent('Microsoft Learn', 'https://learn.microsoft.com/api/mcp');

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
