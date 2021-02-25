<div align="center">
  <br />
  <p>
    <a href="https://discord.js.org"><img src="https://discord.js.org/static/logo.svg" width="546" alt="discord.js" /></a>
  </p>
  <br />
  <p>
    <a href="https://discord.gg/bRCvFy9"><img src="https://img.shields.io/discord/222078108977594368?color=7289da&logo=discord&logoColor=white" alt="Discord server" /></a>
    <a href="https://www.npmjs.com/package/discord.js"><img src="https://img.shields.io/npm/v/discord.js.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/discord.js"><img src="https://img.shields.io/npm/dt/discord.js.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://github.com/discordjs/discord.js/actions"><img src="https://github.com/discordjs/discord.js/workflows/Testing/badge.svg" alt="Build status" /></a>
    <a href="https://david-dm.org/discordjs/discord.js"><img src="https://img.shields.io/david/discordjs/discord.js.svg?maxAge=3600" alt="Dependencies" /></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/discord.js/"><img src="https://nodei.co/npm/discord.js.png?downloads=true&stars=true" alt="npm installnfo" /></a>
  </p>
</div>

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

discord.js-lite is a powerful fork of the [discord.js](https://github.com/discordjs/discord.js) [Node.js](https://nodejs.org) module 

The module allows you to communicate with the [Discord HTTP API](https://discord.com/developers/docs/intro) without the 
need for connecting to the [websocket gateway](https://discord.com/developers/docs/topics/gateway) and the complexity of managing that

When operating a bot at scale it is more performant to be able to send messages and interact with the Discord API without 
the need to login and receive gateway data from Discord. 

discord.js-lite allows you to send messages as well as interact with the Discord API in a fast and efficient manner 

- Object-oriented
- Predictable abstractions from [discord.js](https://github.com/discordjs/discord.js)
- Extremely performant
- No login required
- Not event driven
- One way communication

⚠️ Due to the lack of gateway connection this library will not receive events meaning it is very easy to get
rate limited and not know. There are internal features to prevent rate limiting but it is still possible.
Being rate limited can lead to temporary or permanent bans from use of the Discord API I suggest you know what 
you are doing before using this library ⚠️

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

✔️ Fetching information about an emoji

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

`npm install discord.js-lite`  

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

Using discord.js-lite we can combine the efficiency of method 3 with the ease of use of methods 1 and 2

```js
client.channel('801403698974556161').send('Message')
```

This makes 1 api call. Doesn't check the cache. Just does what you want no questions asked

## Links

- [Website](https://discord.js.org/) ([source](https://github.com/discordjs/website))
- [Documentation](https://discord.js.org/#/docs/main/master/general/welcome)
- [Guide](https://discordjs.guide/) ([source](https://github.com/discordjs/guide)) - this is still for stable  
  See also the [Update Guide](https://discordjs.guide/additional-info/changes-in-v12.html), including updated and removed items in the library.
- [Discord.js Discord server](https://discord.gg/bRCvFy9)
- [Discord API Discord server](https://discord.gg/discord-api)
- [GitHub](https://github.com/discordjs/discord.js)
- [NPM](https://www.npmjs.com/package/discord.js)
- [Related libraries](https://discordapi.com/unofficial/libs.html)

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the
[documentation](https://discord.js.org/#/docs).  
See [the contribution guide](https://github.com/discordjs/discord.js/blob/master/.github/CONTRIBUTING.md) if you'd like to submit a PR.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle
nudge in the right direction, please don't hesitate to join our official [Discord.js Server](https://discord.gg/bRCvFy9).
