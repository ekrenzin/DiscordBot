const Discord = require('discord.js');
const client = new Discord.Client();

const { Firestore } = require('@google-cloud/firestore');
const admin = require("firebase-admin");
const serviceAccount = require("./firebase.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "firebase url goes here"
});

const db = admin.firestore();
const channelID = "key"
const discordAPIKey = "key"

client.login(discordAPIKey);

//load the bot
client.once('ready', async () => {
    const channel = client.channels.cache.get(channelID);
    //can do things like alert the channel that the bot has connected
})

//welcome a new user
client.on('guildMemberAdd', member => {
    const channel = client.channels.cache.get(channelID);
    try {
        channel.send(`Welcome ${member.displayName}!`);
    } catch (err) {
        console.log({ err: err, member: member })
    }
});

client.on('message', async message => {
    const userTag = message.author.id
    const messageAuthor = message.author.username
    const userStore = db.collection(`users/${messageAuthor + userTag}/messages`)
    await userStore.add({
        messageAuthor: messageAuthor,
        message: message.content
    });
    if (message.content.toLowerCase() == 'bacon')
        message.channel.send('Careful, you might summon <@playerID>')
    if (message.content.toLowerCase().includes('red bull') || message.content.toLowerCase().includes('redbull'))
        message.channel.send('it gives <@playerID> wings!')

    //simple code that reads the message and sends one back if it contains flavor
});

//voting
client.on('message', async message => {
    if (message.content.toLowerCase().indexOf('!vote for') === 0) {
        sendVote(message, true)
    } else if (message.content.toLowerCase().indexOf('!vote against') === 0) {
        sendVote(message, false)
    }
    
    //simple code that reads the start of the message to check for command "!vote for"
});

async function sendVote(message, type) {
    const tLength = type ? 9 : 13
    const vote = message.content.substring(tLength)
    const voter = message.author.username
    const votedTS = message.createdTimestamp
    const voteChannel = message.channel.name
    const voteStore = db.collection(`voting/${voteChannel}/${vote}`)
    const voteDoc = voteStore.doc(voter);
    const typeString = type ? 'for' : 'against'
    await voteDoc.set({
        voted: votedTS,
        type: type
    });
    const againstVotes = await voteStore
        .where('type', '==', false)
        .get()
    const forVotes = await voteStore
        .where('type', '==', true)
        .get()

    const aVCount = againstVotes && againstVotes.docs.length ? againstVotes.docs.length : 0
    const fVCount = forVotes && forVotes.docs.length ? forVotes.docs.length : 0

    message.channel.send(`You voted ${typeString} ${vote}. There are currently ${fVCount} for and ${aVCount} against.`)
}