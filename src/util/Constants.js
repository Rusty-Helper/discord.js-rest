'use strict';

const Package = (exports.Package = require('../../package.json'));
const { Error, RangeError } = require('../errors');

/**
 * Options for a client.
 * @typedef {Object} ClientOptions
 * @property {number} [messageCacheMaxSize=200] Maximum number of messages to cache per channel
 * (-1 or Infinity for unlimited - don't do this without message sweeping, otherwise memory usage will climb
 * indefinitely)
 * @property {number} [messageCacheLifetime=0] How long a message should stay in the cache until it is considered
 * sweepable (in seconds, 0 for forever)
 * @property {number} [messageSweepInterval=0] How frequently to remove messages from the cache that are older than
 * the message cache lifetime (in seconds, 0 for never)
 * @property {MessageMentionOptions} [allowedMentions] Default value for {@link MessageOptions#allowedMentions}
 * @property {number} [restTimeOffset=500] Extra time in milliseconds to wait before continuing to make REST
 * requests (higher values will reduce rate-limiting errors on bad connections)
 * @property {number} [restRequestTimeout=15000] Time to wait before cancelling a REST request, in milliseconds
 * @property {number} [restSweepInterval=60] How frequently to delete inactive request buckets, in seconds
 * (or 0 for never)
 * @property {number} [retryLimit=1] How many times to retry on 5XX errors (Infinity for indefinite amount of retries)
 * @property {HTTPOptions} [http] HTTP options
 */
exports.DefaultOptions = {
  messageCacheMaxSize: 200,
  messageCacheLifetime: 0,
  messageSweepInterval: 0,
  restRequestTimeout: 15000,
  retryLimit: 1,
  restTimeOffset: 500,
  restSweepInterval: 60,

  /**
   * HTTP options
   * @typedef {Object} HTTPOptions
   * @property {number} [version=7] API version to use
   * @property {string} [api='https://discord.com/api'] Base url of the API
   * @property {string} [cdn='https://cdn.discordapp.com'] Base url of the CDN
   * @property {string} [invite='https://discord.gg'] Base url of invites
   * @property {string} [template='https://discord.new'] Base url of templates
   */
  http: {
    version: 8,
    api: 'https://discord.com/api',
    cdn: 'https://cdn.discordapp.com',
    invite: 'https://discord.gg',
    template: 'https://discord.new',
  },
};

exports.UserAgent = `DiscordBot (${Package.homepage.split('#')[0]}, ${Package.version}) Node.js/${process.version}`;

const AllowedImageFormats = ['webp', 'png', 'jpg', 'jpeg', 'gif'];

const AllowedImageSizes = Array.from({ length: 9 }, (e, i) => 2 ** (i + 4));

function makeImageUrl(root, { format = 'webp', size } = {}) {
  if (format && !AllowedImageFormats.includes(format)) throw new Error('IMAGE_FORMAT', format);
  if (size && !AllowedImageSizes.includes(size)) throw new RangeError('IMAGE_SIZE', size);
  return `${root}.${format}${size ? `?size=${size}` : ''}`;
}
/**
 * Options for Image URLs.
 * @typedef {Object} ImageURLOptions
 * @property {string} [format] One of `webp`, `png`, `jpg`, `jpeg`, `gif`. If no format is provided,
 * defaults to `webp`.
 * @property {boolean} [dynamic] If true, the format will dynamically change to `gif` for
 * animated avatars; the default is false.
 * @property {number} [size] One of `16`, `32`, `64`, `128`, `256`, `512`, `1024`, `2048`, `4096`
 */

exports.Endpoints = {
  CDN(root) {
    return {
      Emoji: (emojiID, format = 'png') => `${root}/emojis/${emojiID}.${format}`,
      Asset: name => `${root}/assets/${name}`,
      DefaultAvatar: discriminator => `${root}/embed/avatars/${discriminator}.png`,
      Avatar: (userID, hash, format = 'webp', size, dynamic = false) => {
        if (dynamic) format = hash.startsWith('a_') ? 'gif' : format;
        return makeImageUrl(`${root}/avatars/${userID}/${hash}`, { format, size });
      },
      Banner: (guildID, hash, format = 'webp', size) =>
        makeImageUrl(`${root}/banners/${guildID}/${hash}`, { format, size }),
      Icon: (guildID, hash, format = 'webp', size, dynamic = false) => {
        if (dynamic) format = hash.startsWith('a_') ? 'gif' : format;
        return makeImageUrl(`${root}/icons/${guildID}/${hash}`, { format, size });
      },
      AppIcon: (clientID, hash, { format = 'webp', size } = {}) =>
        makeImageUrl(`${root}/app-icons/${clientID}/${hash}`, { size, format }),
      AppAsset: (clientID, hash, { format = 'webp', size } = {}) =>
        makeImageUrl(`${root}/app-assets/${clientID}/${hash}`, { size, format }),
      GDMIcon: (channelID, hash, format = 'webp', size) =>
        makeImageUrl(`${root}/channel-icons/${channelID}/${hash}`, { size, format }),
      Splash: (guildID, hash, format = 'webp', size) =>
        makeImageUrl(`${root}/splashes/${guildID}/${hash}`, { size, format }),
      DiscoverySplash: (guildID, hash, format = 'webp', size) =>
        makeImageUrl(`${root}/discovery-splashes/${guildID}/${hash}`, { size, format }),
      TeamIcon: (teamID, hash, { format = 'webp', size } = {}) =>
        makeImageUrl(`${root}/team-icons/${teamID}/${hash}`, { size, format }),
    };
  },
  invite: (root, code) => `${root}/${code}`,
  botGateway: '/gateway/bot',
};

/**
 * A valid scope to request when generating an invite link.
 * <warn>Scopes that require whitelist are not considered valid for this generator</warn>
 * * `applications.builds.read`: allows reading build data for a users applications
 * * `applications.commands`: allows this bot to create commands in the server
 * * `applications.entitlements`: allows reading entitlements for a users applications
 * * `applications.store.update`: allows reading and updating of store data for a users applications
 * * `connections`: makes the endpoint for getting a users connections available
 * * `email`: allows the `/users/@me` endpoint return with an email
 * * `identify`: allows the `/users/@me` endpoint without an email
 * * `guilds`: makes the `/users/@me/guilds` endpoint available for a user
 * * `guilds.join`: allows the bot to join the user to any guild it is in using Guild#addMember
 * * `gdm.join`: allows joining the user to a group dm
 * * `webhook.incoming`: generates a webhook to a channel
 * @typedef {string} InviteScope
 */
exports.InviteScopes = [
  'applications.builds.read',
  'applications.commands',
  'applications.entitlements',
  'applications.store.update',
  'connections',
  'email',
  'identity',
  'guilds',
  'guilds.join',
  'gdm.join',
  'webhook.incoming',
];

/**
 * The type of a message, e.g. `DEFAULT`. Here are the available types:
 * * DEFAULT
 * * RECIPIENT_ADD
 * * RECIPIENT_REMOVE
 * * CALL
 * * CHANNEL_NAME_CHANGE
 * * CHANNEL_ICON_CHANGE
 * * PINS_ADD
 * * GUILD_MEMBER_JOIN
 * * USER_PREMIUM_GUILD_SUBSCRIPTION
 * * USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1
 * * USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2
 * * USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3
 * * CHANNEL_FOLLOW_ADD
 * * GUILD_DISCOVERY_DISQUALIFIED
 * * GUILD_DISCOVERY_REQUALIFIED
 * * REPLY
 * @typedef {string} MessageType
 */
exports.MessageTypes = [
  'DEFAULT',
  'RECIPIENT_ADD',
  'RECIPIENT_REMOVE',
  'CALL',
  'CHANNEL_NAME_CHANGE',
  'CHANNEL_ICON_CHANGE',
  'PINS_ADD',
  'GUILD_MEMBER_JOIN',
  'USER_PREMIUM_GUILD_SUBSCRIPTION',
  'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1',
  'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2',
  'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3',
  'CHANNEL_FOLLOW_ADD',
  null,
  'GUILD_DISCOVERY_DISQUALIFIED',
  'GUILD_DISCOVERY_REQUALIFIED',
  null,
  null,
  null,
  'REPLY',
];

/**
 * The types of messages that are `System`. The available types are `MessageTypes` excluding:
 * * DEFAULT
 * * REPLY
 * @typedef {string} SystemMessageType
 */
exports.SystemMessageTypes = exports.MessageTypes.filter(type => type && type !== 'DEFAULT' && type !== 'REPLY');

exports.ChannelTypes = {
  TEXT: 0,
  DM: 1,
  VOICE: 2,
  GROUP: 3,
  CATEGORY: 4,
  NEWS: 5,
  STORE: 6,
};

exports.ClientApplicationAssetTypes = {
  SMALL: 1,
  BIG: 2,
};

exports.Colors = {
  DEFAULT: 0x000000,
  WHITE: 0xffffff,
  AQUA: 0x1abc9c,
  GREEN: 0x2ecc71,
  BLUE: 0x3498db,
  YELLOW: 0xffff00,
  PURPLE: 0x9b59b6,
  LUMINOUS_VIVID_PINK: 0xe91e63,
  GOLD: 0xf1c40f,
  ORANGE: 0xe67e22,
  RED: 0xe74c3c,
  GREY: 0x95a5a6,
  NAVY: 0x34495e,
  DARK_AQUA: 0x11806a,
  DARK_GREEN: 0x1f8b4c,
  DARK_BLUE: 0x206694,
  DARK_PURPLE: 0x71368a,
  DARK_VIVID_PINK: 0xad1457,
  DARK_GOLD: 0xc27c0e,
  DARK_ORANGE: 0xa84300,
  DARK_RED: 0x992d22,
  DARK_GREY: 0x979c9f,
  DARKER_GREY: 0x7f8c8d,
  LIGHT_GREY: 0xbcc0c0,
  DARK_NAVY: 0x2c3e50,
  BLURPLE: 0x7289da,
  GREYPLE: 0x99aab5,
  DARK_BUT_NOT_BLACK: 0x2c2f33,
  NOT_QUITE_BLACK: 0x23272a,
};

/**
 * The value set for the explicit content filter levels for a guild:
 * * DISABLED
 * * MEMBERS_WITHOUT_ROLES
 * * ALL_MEMBERS
 * @typedef {string} ExplicitContentFilterLevel
 */
exports.ExplicitContentFilterLevels = ['DISABLED', 'MEMBERS_WITHOUT_ROLES', 'ALL_MEMBERS'];

/**
 * The value set for the verification levels for a guild:
 * * NONE
 * * LOW
 * * MEDIUM
 * * HIGH
 * * VERY_HIGH
 * @typedef {string} VerificationLevel
 */
exports.VerificationLevels = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];

/**
 * An error encountered while performing an API request. Here are the potential errors:
 * * UNKNOWN_ACCOUNT
 * * UNKNOWN_APPLICATION
 * * UNKNOWN_CHANNEL
 * * UNKNOWN_GUILD
 * * UNKNOWN_INTEGRATION
 * * UNKNOWN_INVITE
 * * UNKNOWN_MEMBER
 * * UNKNOWN_MESSAGE
 * * UNKNOWN_OVERWRITE
 * * UNKNOWN_PROVIDER
 * * UNKNOWN_ROLE
 * * UNKNOWN_TOKEN
 * * UNKNOWN_USER
 * * UNKNOWN_EMOJI
 * * UNKNOWN_WEBHOOK
 * * UNKNOWN_BAN
 * * UNKNOWN_GUILD_TEMPLATE
 * * BOT_PROHIBITED_ENDPOINT
 * * BOT_ONLY_ENDPOINT
 * * ANNOUNCEMENT_EDIT_LIMIT_EXCEEDED
 * * CHANNEL_HIT_WRITE_RATELIMIT
 * * MAXIMUM_GUILDS
 * * MAXIMUM_FRIENDS
 * * MAXIMUM_PINS
 * * MAXIMUM_ROLES
 * * MAXIMUM_WEBHOOKS
 * * MAXIMUM_REACTIONS
 * * MAXIMUM_CHANNELS
 * * MAXIMUM_ATTACHMENTS
 * * MAXIMUM_INVITES
 * * GUILD_ALREADY_HAS_TEMPLATE
 * * UNAUTHORIZED
 * * ACCOUNT_VERIFICATION_REQUIRED
 * * REQUEST_ENTITY_TOO_LARGE
 * * FEATURE_TEMPORARILY_DISABLED
 * * USER_BANNED
 * * ALREADY_CROSSPOSTED
 * * MISSING_ACCESS
 * * INVALID_ACCOUNT_TYPE
 * * CANNOT_EXECUTE_ON_DM
 * * EMBED_DISABLED
 * * CANNOT_EDIT_MESSAGE_BY_OTHER
 * * CANNOT_SEND_EMPTY_MESSAGE
 * * CANNOT_MESSAGE_USER
 * * CANNOT_SEND_MESSAGES_IN_VOICE_CHANNEL
 * * CHANNEL_VERIFICATION_LEVEL_TOO_HIGH
 * * OAUTH2_APPLICATION_BOT_ABSENT
 * * MAXIMUM_OAUTH2_APPLICATIONS
 * * INVALID_OAUTH_STATE
 * * MISSING_PERMISSIONS
 * * INVALID_AUTHENTICATION_TOKEN
 * * NOTE_TOO_LONG
 * * INVALID_BULK_DELETE_QUANTITY
 * * CANNOT_PIN_MESSAGE_IN_OTHER_CHANNEL
 * * INVALID_OR_TAKEN_INVITE_CODE
 * * CANNOT_EXECUTE_ON_SYSTEM_MESSAGE
 * * CANNOT_EXECUTE_ON_CHANNEL_TYPE
 * * INVALID_OAUTH_TOKEN
 * * INVALID_RECIPIENTS
 * * BULK_DELETE_MESSAGE_TOO_OLD
 * * INVALID_FORM_BODY
 * * INVITE_ACCEPTED_TO_GUILD_NOT_CONTAINING_BOT
 * * INVALID_API_VERSION
 * * CANNOT_DELETE_COMMUNITY_REQUIRED_CHANNEL
 * * REACTION_BLOCKED
 * * RESOURCE_OVERLOADED
 * @typedef {string} APIError
 */
exports.APIErrors = {
  UNKNOWN_ACCOUNT: 10001,
  UNKNOWN_APPLICATION: 10002,
  UNKNOWN_CHANNEL: 10003,
  UNKNOWN_GUILD: 10004,
  UNKNOWN_INTEGRATION: 10005,
  UNKNOWN_INVITE: 10006,
  UNKNOWN_MEMBER: 10007,
  UNKNOWN_MESSAGE: 10008,
  UNKNOWN_OVERWRITE: 10009,
  UNKNOWN_PROVIDER: 10010,
  UNKNOWN_ROLE: 10011,
  UNKNOWN_TOKEN: 10012,
  UNKNOWN_USER: 10013,
  UNKNOWN_EMOJI: 10014,
  UNKNOWN_WEBHOOK: 10015,
  UNKNOWN_BAN: 10026,
  UNKNOWN_GUILD_TEMPLATE: 10057,
  BOT_PROHIBITED_ENDPOINT: 20001,
  BOT_ONLY_ENDPOINT: 20002,
  ANNOUNCEMENT_EDIT_LIMIT_EXCEEDED: 20022,
  CHANNEL_HIT_WRITE_RATELIMIT: 20028,
  MAXIMUM_GUILDS: 30001,
  MAXIMUM_FRIENDS: 30002,
  MAXIMUM_PINS: 30003,
  MAXIMUM_ROLES: 30005,
  MAXIMUM_WEBHOOKS: 30007,
  MAXIMUM_REACTIONS: 30010,
  MAXIMUM_CHANNELS: 30013,
  MAXIMUM_ATTACHMENTS: 30015,
  MAXIMUM_INVITES: 30016,
  GUILD_ALREADY_HAS_TEMPLATE: 30031,
  UNAUTHORIZED: 40001,
  ACCOUNT_VERIFICATION_REQUIRED: 40002,
  REQUEST_ENTITY_TOO_LARGE: 40005,
  FEATURE_TEMPORARILY_DISABLED: 40006,
  USER_BANNED: 40007,
  ALREADY_CROSSPOSTED: 40033,
  MISSING_ACCESS: 50001,
  INVALID_ACCOUNT_TYPE: 50002,
  CANNOT_EXECUTE_ON_DM: 50003,
  EMBED_DISABLED: 50004,
  CANNOT_EDIT_MESSAGE_BY_OTHER: 50005,
  CANNOT_SEND_EMPTY_MESSAGE: 50006,
  CANNOT_MESSAGE_USER: 50007,
  CANNOT_SEND_MESSAGES_IN_VOICE_CHANNEL: 50008,
  CHANNEL_VERIFICATION_LEVEL_TOO_HIGH: 50009,
  OAUTH2_APPLICATION_BOT_ABSENT: 50010,
  MAXIMUM_OAUTH2_APPLICATIONS: 50011,
  INVALID_OAUTH_STATE: 50012,
  MISSING_PERMISSIONS: 50013,
  INVALID_AUTHENTICATION_TOKEN: 50014,
  NOTE_TOO_LONG: 50015,
  INVALID_BULK_DELETE_QUANTITY: 50016,
  CANNOT_PIN_MESSAGE_IN_OTHER_CHANNEL: 50019,
  INVALID_OR_TAKEN_INVITE_CODE: 50020,
  CANNOT_EXECUTE_ON_SYSTEM_MESSAGE: 50021,
  CANNOT_EXECUTE_ON_CHANNEL_TYPE: 50024,
  INVALID_OAUTH_TOKEN: 50025,
  INVALID_RECIPIENTS: 50033,
  BULK_DELETE_MESSAGE_TOO_OLD: 50034,
  INVALID_FORM_BODY: 50035,
  INVITE_ACCEPTED_TO_GUILD_NOT_CONTAINING_BOT: 50036,
  INVALID_API_VERSION: 50041,
  CANNOT_DELETE_COMMUNITY_REQUIRED_CHANNEL: 50074,
  REACTION_BLOCKED: 90001,
  RESOURCE_OVERLOADED: 130000,
};

/**
 * The value set for a guild's default message notifications, e.g. `ALL`. Here are the available types:
 * * ALL
 * * MENTIONS
 * @typedef {string} DefaultMessageNotifications
 */
exports.DefaultMessageNotifications = ['ALL', 'MENTIONS'];

/**
 * The value set for a team members's membership state:
 * * INVITED
 * * ACCEPTED
 * @typedef {string} MembershipStates
 */
exports.MembershipStates = [
  // They start at 1
  null,
  'INVITED',
  'ACCEPTED',
];

/**
 * The value set for a webhook's type:
 * * Incoming
 * * Channel Follower
 * @typedef {string} WebhookTypes
 */
exports.WebhookTypes = [
  // They start at 1
  null,
  'Incoming',
  'Channel Follower',
];

/**
 * An overwrite type:
 * * role
 * * member
 * @typedef {string} OverwriteType
 */
exports.OverwriteTypes = createEnum(['role', 'member']);

function createEnum(keys) {
  const obj = {};
  for (const [index, key] of keys.entries()) {
    if (key === null) continue;
    obj[key] = index;
    obj[index] = key;
  }
  return obj;
}
