# Discord.js REST HTTP Client

## Table of contents

- [About](#about)
- [Use Cases](#use-cases)
  - [When you should use](#use-cases)
  - [When you should not use](#use-cases)
- [Installation](#installation)
- [Example Usage](#example-usage)
  - [Sending Messages](#sending-messages)
- [Links](#links)
- [Contributing](#contributing)
- [Help](#help)

## About

discord.js-rest is a powerful fork of the popular [discord.js](https://github.com/discordjs/discord.js)

The module allows you to communicate with the [Discord REST HTTP API](https://discord.com/developers/docs/intro) without the 
need for connecting to the [websocket gateway](https://discord.com/developers/docs/topics/gateway) and the complexity of managing that

When operating a bot at scale it is more performant to be able to send messages and interact with the Discord API without 
the need to login and receive gateway data from Discord. 

discord.js-rest allows you to send messages as well as interact with the Discord API in a fast and efficient manner 

- Object-oriented
- Predictable abstractions from [discord.js](https://github.com/discordjs/discord.js)
- Extremely performant
- No login required
- Not event driven

## Use Cases

This module is **NOT** meant as a replacement to [discord.js](https://github.com/discordjs/discord.js) and you should not treat it like on

You should first have a strong grasp of [discord.js](https://github.com/discordjs/discord.js) as this module is a fork of it.
I have tried to preserve the names and syntax of the origional libarry

This module is designed to be used as an ephemeral Discord API client to get data you need and run a short lived task.

Unlike discord.js this module is *not* event driven meaning you need to control when the code is run

## When you should use

✔️ Posting a message to a channel after an AWS Lambda event has triggered

✔️ Sending/Editing messages to a guild on a cron job

✔️ Checking if the bot has permissions in a certain channel

✔️ Fetching information about a guild / user / emoji from a dashboard

## When you should not use

❌ Running code based on a user input (like a command)

❌ Reacting to any event / using the websocket gateway

❌ If you want the process to be online 24/7

❌ Changing the bots status or interacting with the bot user in any fashion

❌ If you want to use partials

❌ When using caching in any way

## Installation

**Node.js 14.0.0 or newer is required.**  
Ignore any warnings about unmet peer dependencies, as they're all optional.

`npm install discord.js-rest`  

## Example usage

```js
const Discord = require('discord.js');
const client = new Discord.Client('token');

if (client.channel('801403698974556161').myPermissions().has('ADMINISTRATOR')) {
  const message = await client.channel('801403698974556161').send('Your daily 7am wake up call!')
  await client.message(message.id).edit('Nevermind its summer you can sleep until 9am!')
}
```

### Sending Messages

How you would normally send messages in discord.js to a channel not in response to a message

```js
// Method 1 - With caching:
client.channels.cache.get('801403698974556161').send('Message')
```

This method fetches the channel directly from cache which, although fast, will use up a lot
of memory and is not viable with sharding

```js
// Method 2 - Without caching:
client.channels.fetch('801403698974556161').send('Message')
```

Method 2 fetches from cache first and if not it fetches from the Discord API. This takes time
as it needs to make a request before it can sent the message

```js
// Method 3 - Another method witout caching:
const guild = new discord.Guild(client, { id: '801403698974556161' });
const channel = new discord.TextChannel(guild, { id: '801403698974556161' });
channel.send('Message')
```

Method 3 is the fastest as it constructs the text channel without fetching anything from Discord.
However it looks very clumsy and isn't necessarily obvious what is going on.

Using discord.js-rest we can combine the efficiency of method 3 with the ease of use of methods 1 and 2

```js
client.channel('801403698974556161').send('Message')
```

This makes 1 api call. Doesn't check the cache. Just does what you want no questions asked

## Links

- [Discord.js Discord server](https://discord.gg/bRCvFy9)
- [Discord API Discord server](https://discord.gg/discord-api)
- [GitHub](https://github.com/rusty-helper/discord.js-rest)
- [NPM](https://www.npmjs.com/package/discord.js-rest)
- [Related libraries](https://discordapi.com/unofficial/libs.html)

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the
[documentation](https://discord.js.org/#/docs).  
See [the contribution guide](https://github.com/discordjs/discord.js/blob/master/.github/CONTRIBUTING.md) if you'd like to submit a PR.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle
nudge in the right direction, please don't hesitate to join our official [Discord.js Server](https://discord.gg/bRCvFy9).
