// Load up the discord.js library
const Discord = require("discord.js");
const fs = require('fs');
const moment = require('moment');
const cheerio = require("cheerio");
const got = require("got");
const path = require("path")

const client = new Discord.Client({ ws: { intents: new Discord.Intents(Discord.Intents.ALL) }});
var userData = JSON.parse(fs.readFileSync('userData.json'));
var extraVars = JSON.parse(fs.readFileSync('extraVars.json'));
var images = JSON.parse(fs.readFileSync('images.json'));

const nullescape = "84230409uau80na098d9fipaok4"
extraVars["playerid"] = nullescape;

const express = require('express');
const app = express();

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.get("/smg", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
})

app.use(express.static(__dirname));

app.listen(process.env.PORT || 3000);

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./package.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.
function update_stats() {
    var Count;
    for (Count in client.users.cache.array()) {
      var User = client.users.cache.array()[Count];
      if (!User.bot) {
        if (!userData[User.id]) {
          userData[User.id] = {};
          userData[User.id].muted = false;
        
        if (!userData[User.id].coin_inc) userData[User.id].coin_inc = 0;
        if (!userData[User.id].extraluck) userData[User.id].extraluck = 0;
        if (!userData[User.id].health) userData[User.id].health = 100;
        if (!userData[User.id].credits) userData[User.id].credits = 0;
        if (!userData[User.id].rep) userData[User.id].rep = 0;
        if (!userData[User.id].messages) userData[User.id].messages = 0;
        if (!userData[User.id].rank) userData[User.id].rank = "Starter Pack";
        if (!userData[User.id].ranknum) userData[User.id].ranknum = 1;
        if (!userData[User.id].daily) userData[User.id].daily = "Not Claimed";
        if (!userData[User.id].warnings) userData[User.id].warnings = 0;
        if (!userData[User.id].warnlist) userData[User.id].warnlist = [];
        if (userData[User.id].credits < 0) userData[User.id].credits = 0;
        if (!userData[User.id].diamonds) userData[User.id].diamonds = 0;
        if (userData[User.id].diamonds < 0) userData[User.id].diamonds = 0;
        if (!userData[User.id].canadventure || userData[User.id].canadventure == "no") userData[User.id].canadventure = "yes";
        if (!userData[User.id].successrate) userData[User.id].successrate = 50;
        if (!userData[User.id].regenrate) userData[User.id].regenrate = 60;
        if (!userData[User.id].regen_inc) userData[User.id].regen_inc = 1;
      }
    }
    }
}

function increment_health() {
  var Count;
  for (Count in client.users.cache.array()) {
    var User = client.users.cache.array()[Count];
    if (!User.bot) {
       if (!userData[User.id]) {
          userData[User.id] = {};
        }
      if (userData[User.id].health < 100) userData[User.id].health += userData[User.id].regen_inc;
      if (userData[User.id].health > 100) userData[User.id].health = 100;
    }
  }
}

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  
  // console.log(client.guilds);
  // console.log(client.users.cache.get('295550034475352066').username)
  
  // client.channels.get('696116524750077993').send("");
  // client.users.cache.get('603790639502589964').send("")
  // client.channels.get('696116524750077993').send({files: ["https://i.ibb.co/JjYfhFn/Sadlenium.png"]})
  
  client.user.setActivity("s!help", {type: "LISTENING"});
  update_stats();
  setInterval(increment_health, 180000);
});

client.on('guildMemberAdd', member => {
    var welcomemessage = extraVars["channelmessage"].replace(/{player}/g, member.user.username)
    welcomemessage = welcomemessage.replace(/{mention_player}/g, "<@!" + member.user.id + ">")
    if (extraVars["togglewelcome"]) {
      member.guild.channels.find('name', extraVars["channelname"]).send(welcomemessage)
    }
    if (member.guild.id == "673903805431283754") {
      var role = client.guilds.cache.get('673903805431283754').roles.cache.find(role => role.name === "Unverified");
      client.channels.get('680318685914857514').send("Welcome to the server, <@!" + member.user.id + ">! Please fill out the form in the pinned messages and we'll be right with you!")
      member.addRole(role);
    }
});

client.on('guildMemberRemove', member => {
    var leavemessage = extraVars["channelquitmessage"].replace(/{player}/g, member.user.username)
    var tag = "**" + member.user.tag + "**"
    leavemessage = leavemessage.replace(/{mention_player}/g, tag)
    if (extraVars["togglewelcome"]) {
      member.guild.channels.find('name', extraVars["channelquitname"]).send(leavemessage)
    }
});


client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity("s!help", {type: "LISTENING"});
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity("s!help", {type: "LISTENING"});
});

client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  if (message.content.toLowerCase().includes("off-on")) {
    return message.reply("No, that's wrong. on-off.");
  }
  
  if (!message.guild) {
    client.users.cache.get("282319071263981568").send("**" + message.author.username + " pmed the bot: '" + message.content + "'**");
    console.log(message.author.username + " pmed the bot: '" + message.content + "'")
    return
  }

  // SPY ON SERVERS THE BOT IS IN:
  // client.users.cache.get('282319071263981568').send("[" + message.channel.name + "] " + message.author.username + " >> " + message.content);
  
  var sender = message.author;
  if (message.mentions.members) var mentioned = message.mentions.members.first();
  if (message.mentions.users) var mentioneduser = message.mentions.users.first();
  const serverinfo = "(" + message.guild.name + ") "
  var consolelog = serverinfo + message.author.username + ": " + config.prefix;
  
  // if (sender == client.users.cache.get("668174570750083100") && message.channel.id != '674055833469976596') {
  //   message.delete();
  // }
  
  if (!sender.bot) {
    if (!userData[sender.id]) {
      userData[sender.id] = {};
      userData[sender.id].muted = false;
      if (!userData[sender.id].coin_inc) userData[sender.id].coin_inc = 0;
      if (!userData[sender.id].extraluck) userData[sender.id].extraluck = 0;
      if (!userData[sender.id].bankbal) userData[sender.id].bankbal = 0;
      if (!userData[sender.id].health) userData[sender.id].health = 100;
    }
    if (!userData[sender.id].credits) userData[sender.id].credits = 0;
    if (!userData[sender.id].rep) userData[sender.id].rep = 0;
    if (!userData[sender.id].messages) userData[sender.id].messages = 0;
    if (!userData[sender.id].rank) userData[sender.id].rank = "Starter Pack";
    if (!userData[sender.id].ranknum) userData[sender.id].ranknum = 1;
    if (!userData[sender.id].daily) userData[sender.id].daily = "Not Claimed";
    if (!userData[sender.id].warnings) userData[sender.id].warnings = 0;
    if (!userData[sender.id].warnlist) userData[sender.id].warnlist = [];
    if (!userData[sender.id].diamonds) userData[sender.id].diamonds = 0;
    if (userData[sender.id].diamonds < 0) userData[sender.id].diamonds = 0;
    if (!userData[sender.id].canadventure) userData[sender.id].canadventure = "yes";
    if (!userData[sender.id].successrate) userData[sender.id].successrate = 50;
    if (!userData[sender.id].regenrate) userData[sender.id].regenrate = 60;
    if (!userData[sender.id].regen_inc) userData[sender.id].regen_inc = 1;
  }
  
  fs.writeFile('userData.json', JSON.stringify(userData), (err) => {
    if (err) console.error(err);
  })
  
  fs.writeFile('extraVars.json', JSON.stringify(extraVars), (err) => {
    if (err) console.error(err);
  })
  
  fs.writeFile('images.json', JSON.stringify(images), (err) => {
    if (err) console.error(err);
  })
  
  
  const content = message.content.trim().split(/ +/g);
    if (extraVars["dadbot"]) {
      if (message.content[0].toLowerCase() == "im" || message.content[0].toLowerCase() == "i'm") {
        message.channel.send("Hi " + content.slice(1).join(" ") + ", I'm Skylar!")
      }
      if (message.content[0].toLowerCase() + message.content[1].toLowerCase() == "iam") {
        message.channel.send("Hi " + content.slice(2).join(" ") + ", I'm Skylar!")
      }
    }
  
  
  userData[sender.id].messages++;
  if (message.channel.id != '674055833469976596' && message.channel.id != '674055875186393108') {
    userData[sender.id].rep++;
  }
  checkrank();
  
  if (message.content == extraVars["repeatword"]) {
    extraVars["repeatword"] = "fjei9a9j4mnfnfoa03ibkmkbks";
    userData[sender.id].credits += Math.round(extraVars["repeataward"]);
    message.reply("You repeated the secret word and have gained a reward of " + Math.round(extraVars["repeataward"]) + " credit(s)!");
    extraVars["repeataward"] = 0;
  }
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;

  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // Let's go with a few common example commands! Feel free to delete or change those.

  if (command == "saveimage") {
    if (!args[0])
      return message.reply("Please include valid arguments to the command: **" + config.prefix + "saveimage name image_url** (image url is optional, you can send the actual image.)");
    if (message.attachments.size > 0) {
      let img_name = args[0];
      var attachment = (message.attachments).array()[0]
      images[img_name] = attachment.url;
      message.reply("Successfully saved that image under the name **" + img_name + "**! Send it with " + config.prefix + "postimage **" + img_name + "**!");
    }
    else {
      let img_name = args[0];
      if (!args[1])
        return message.reply("Please send a valid link URL if you are not supplying an image!");
      images[img_name] = args[1];
      message.reply("Successfully saved that image under the name **" + img_name + "**! Send it with " + config.prefix + "postimage **" + img_name + "**!");
    }
  }
  
  if (command == "postimage") {
    if (!args[0])
      return message.reply("Please supply a valid name for the image you want to post! Example: **" + config.prefix + "postimage example**. Add an image using s!saveimage!");
    let img_name = args[0];
    message.delete();
    message.channel.send(images[img_name]);
  }
  
  if (command == "bump") {
    message.channel.send({
      "embed": {
        "title": "DISBOARD: The Public Server List",
        "description": "<@!" + sender.id + ">,\n      Bump done :thumbsup:\n      Check it on DISBOARD: https://disboard.org/",
        "url": "https://discordapp.com",
        "color": 2868665,
        "image": {
          "url": "https://i.imgur.com/EgtI5xJ.png"
        }
      }
    })
  }

  if (command == "notify") {
    if (client.users.cache.get("282319071263981568") == sender || message.member.hasPermission("ADMINISTRATOR")) {
      if (!args[0]) {
        return message.reply("Please specify a ping as your first argument!")
      }
      var sentPeople = []
      var sentMsg = args.slice(1).join(" ")
      var role = message.guild.roles.cache.find(role => role.name == args[0].replace(/_/g, " "));
      if (!role) {
        return message.reply("Couldn't find a role with the name " + args[0].replace(/_/g, " ") + "!")
      }
      let members = message.guild.members.cache.filter(member => member.roles.has(role));
      console.log(message.guild.members)
      members.forEach(member => {
        if (!member.user.bot && member.roles.has(role.id)) {
          sentPeople.push(member.user.username)
          member.user.send({
            "embed": {
              "title": ":loudspeaker: **Incoming Announcement from " + sender.username + "** :loudspeaker:",
              "description": sentMsg,
              "color": 14653733
            }
          })
        }
      });
      if (sentPeople.length === 0) return message.reply("Your message was not able to be sent!")
      client.users.cache.get("282319071263981568").send("Sent the message `" + sentMsg + "` to " + sentPeople.length + " people: **" + sentPeople.join(" ") + "**")
      message.delete();
    } else {
      return message.reply("You don't have the permission to do this!")
    }
  }

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

  if (command == "image" || command == "p") {
    let tags = args
    let count = 1
    if (!isNaN(args[args.length-1])) {
      count = parseInt(tags.pop())
    }
    tags = tags.join(" ").toLowerCase().trim()
    if (!["470396177590910987", "454550713557843978", "757627909652480223", "255433022382407690", "282319071263981568"].includes(sender.id)) {
      tags += " rating:safe"
    }
    got("https://e621.net/posts?tags=" + tags).then((response) => {
      let $ = cheerio.load(response.body);
      if ($(".has-cropped-true").length + $(".has-cropped-false").length === 0) {
        return message.reply("We couldn't find any results for those tags! Maybe try something else?")
      }
      let imagePool = $(".has-cropped-true,.has-cropped-false")
      shuffle(imagePool)
      for (let i = 0; i < count; i++) {
        if (imagePool.length === 0) return;
        let targetImage = imagePool[i]
        got("https://e621.net" + targetImage.parent.parent.attribs.href).then((response_two) => {
          $ = cheerio.load(response_two.body);
          message.channel.send($("#image")[0].attribs.src || $("#image")[0].children[3].attribs.src).then(msg => {
            msg.react("❌")
            msg.react("✅")
            msg.awaitReactions((reaction, user) => !user.bot && (reaction.emoji.name == '❌' || reaction.emoji.name == '✅'), {max: 1, time: 600000}).then((collected) => {
              if (collected.first().emoji.name == "❌") {
                msg.delete()
                return message.delete()
              } else {
                msg.reply("The post above can no longer be deleted by reaction messages.").then(temp => temp.delete({timeout: 3000}))
                return message.delete()
              }
            })
          })
        })
      }
    })
  }
  
  if (command == "update") {
    if (client.users.cache.get("282319071263981568") == sender || message.member.hasPermission("ADMINISTRATOR")) {
      update_stats();
      userData[sender.id].coin_inc = (userData[sender.id].ranknum * 0.05) - 0.05;
      userData[sender.id].extraluck = userData[sender.id].ranknum - 1;
      userData[sender.id].successrate = (userData[sender.id].ranknum * 2) + 40
      userData[sender.id].regen_inc = (Math.floor(userData[sender.id].ranknum / 5)) + 1;
      return message.reply("Updated all needed stats!");
    } else {
      return message.reply("Sorry, you don't have the permissions to do this!");
    } 
  }
  
  if (command == "adventure" || command == "adv") {
    if (userData[sender.id].canadventure == "yes") {
      if (userData[sender.id].health <= 10) {
        return message.reply("You're too low on health to go on an adventure! Try again when you're in better condition.");
      }
      userData[sender.id].canadventure = "no";
      message.channel.send({"embed": {
        "title": ":crossed_swords: Adventuring... :crossed_swords:",
        "description": "**User: **" + sender.username + "\n**Stats:** :heart: " + userData[sender.id].health + " | :moneybag: " + userData[sender.id].credits + " | :gem: " + userData[sender.id].diamonds + "\n**Equipped:** :archery: None",
        "color": 14653733,
        "thumbnail": {
          "url": message.author.avatarURL
        }
      }})
      .then((msg) => {
        setTimeout(() => {
          let health_message = "";
          let credit_message = "";
          let diamond_message = "";
          let is_lucky = (Math.random() > 0.9);
          let fail_messages = ["Your adventure didn't go so well...", "Your unpreparedness led to your failure...", "Yikes! Better luck next time..."]
          let success_messages = ["Your skills proved worthy to the task at hand!", "You did it! Riches and glory for you!", "You managed to win the battle!"]
          let turnout = (Math.random() > userData[sender.id].successrate / 100) ? true : false; // True is success, false is failure.
          let return_message = (turnout) ? ":trophy: Adventure Success! :trophy:" : ":skull: Adventure Failure... :skull:";
          let random_status = (turnout) ? success_messages[Math.floor(Math.random()*success_messages.length)] : fail_messages[Math.floor(Math.random()*fail_messages.length)]
          if (is_lucky && turnout) random_status = "Lucky you! So many riches!"
          if (turnout) {
            // If you succeed on your adventure.
            let credits_gained = Math.floor(Math.random()*15+15);
            if (is_lucky) credits_gained += Math.floor(Math.random()*75+25)
            userData[sender.id].credits += credits_gained;
            credit_message = " (+" + credits_gained + ")"
            let diamonds_gained = Math.round(Math.random());
            if (is_lucky) diamonds_gained += Math.floor(Math.random()*1+1)
            userData[sender.id].diamonds += diamonds_gained;
            diamond_message = (diamonds_gained > 0) ? " (+" + diamonds_gained + ")" : "";
          } else {
            // If you fail your adventure.
            let health_lost = Math.floor(Math.random()*22+8);
            userData[sender.id].health -= health_lost;
            if (userData[sender.id].health < 0) {
              let required_health = Math.abs(0 - userData[sender.id].health);
              userData[sender.id].health += required_health;
              health_lost -= required_health;
              let credits_lost = Math.floor(Math.random()*175+75);
              if (userData[sender.id].credits - credits_lost < 0) {
                credits_lost = userData[sender.id].credits;
              }
              userData[sender.id].credits -= credits_lost;
              credit_message = " (-" + credits_lost + ")";
            }
            health_message = " (-" + health_lost + ")";
          }
          msg.delete();
          message.channel.send({"embed": {
            "title": return_message,
            "description": "*" + random_status + "*\n**User: **" + sender.username + "\n**Stats:** :heart: " + userData[sender.id].health + health_message + " | :moneybag: " + userData[sender.id].credits + credit_message + " | :gem: " + userData[sender.id].diamonds + diamond_message + "\n**Equipped:** :archery: None",
            "color": 14653733,
            "thumbnail": {
              "url": message.author.avatarURL
            }
          }})
          userData[sender.id].canadventure = "yes";
        }, 3000);
      })
    } else {
      return message.reply("Sorry, you need to wait a bit longer before the 5 minute cooldown ends!")
    }
  }
  
  if (command == "approve" || command == "verify") {
    const member = message.mentions.members.first();
    if (member.id == "658755807210635295") return message.channel.send("Uh— this is awkward. Erm, you are now approved, myself? I dunno how this is supposed to work.");
    var remove_role = client.guilds.cache.get('673903805431283754').roles.cache.find(role => role.name === "Unverified");
    var role = client.guilds.cache.get('673903805431283754').roles.cache.find(role => role.name === "Members");
    member.removeRole(remove_role);
    member.addRole(role);
    message.reply({
      "embed": {
        "title": "**Verification**",
        "description": member.user.username + " has successfully been approved!",
        "color": 14789542
      }
    });
  }
  
  if(command == "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command == "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    if (client.users.cache.get("603790639502589964") == sender) {
      const sayMessage = args.join(" ");
      // Then we delete the command message (sneaky, right?). 
      message.delete().catch(v=>{}); 
      // And we get the bot to say the thing: 
      message.channel.send(sayMessage);
      console.log(sender.username + ": " + config.prefix + "say " + sayMessage)
      return
    }
    if (client.users.cache.get("282319071263981568") != sender && userData[sender.id].credits < 1) {
      message.reply(`Sorry, you require 1 credit to use the ${config.prefix}say command!`);
      return
    }
    userData[sender.id].credits -= 1;
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
    console.log(sender.username + ": " + config.prefix + "say " + sayMessage)
  }
  
  if (command == "toggledad") {
    extraVars["dadbot"] = !extraVars["dadbot"];
    message.reply("Toggled the annoying dadbot messages to: " + extraVars["dadbot"] + ".");
  }
  
  if (command == "purgeuser") {
    if (client.users.cache.get("282319071263981568") == sender || message.member.hasPermission("ADMINISTRATOR")) {
      const user = message.mentions.users.first();
      if (!user && !args[1]) {
        message.reply("Specify a user after the amount of messages to delete!");
      }
      if (!args[0]) message.reply("Specify a number of messages to delete as your first argument!");
      let amount = args[0]
      message.delete();
      message.channel.messages.fetch({
       limit: 100,
      }).then((messages) => {
       if (user) {
       const filterBy = user ? user.id : client.user.id;
       messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);
       }
       message.channel.bulkDelete(messages).catch(error => console.log(error.stack));
       message.reply("Successfully deleted " + amount + " messages from user " + user.username + "!").then(msg => {
         setTimeout(function() { msg.delete(); }, 3000);
       });
      });
    }
  }
  
  if (command == "setname") {
    if (client.users.cache.get("282319071263981568") == sender || message.member.hasPermission("ADMINISTRATOR")) {
      if (!args[0]) return message.reply("Include a valid name to change the channel name to!");
      message.channel.setName("•~" + args.join(" ") + "~•");
      message.reply("Successfully changed the channel name to " + args.join(" ") + "!")
    } else {
      message.reply("You don't have the correct permissions to do that!");
    }
    return
  }
  
  if (command == "getstatus") {
    if (!message.mentions.users.first()) {
      try {
        var user = client.users.cache.find(u => u.username == args.join(" "))
      }
      catch (error) {
        console.log(error)
        return message.reply("Sorry, I couldn't find that player! Make sure to type in a username, not a nickname!")
      }
      try {
        message.channel.send(user.username + "'s status is: " + user.presence.game.state)
      }
      catch (error) {
        console.log(error)
        return message.reply("Is that player offline? I couldn't find anything!")
      }
    } else {
      try {
        var user = message.mentions.users.first();
        console.log(user.username)
      }
      catch (error) {
        return message.reply("Sorry, I couldn't find that player! Make sure to type in a username, not a nickname!")
      }
      try {
        message.channel.send(user.username + "'s status is: " + user.presence.game.state)
      }
      catch (error) {
        return message.reply("Is that player offline? I couldn't find anything!")
      }
    }
  }
  
  if (command == "setstatus") {
    if (!args[0]) message.reply("Please include a message for the bot to set its status to!");
    if (userData[sender.id].credits >= 3) {
      let sayMessage = args.join(" ")
      message.reply("Successfully temporarily set the bot status to '" + sayMessage + "'! 3 credits have been spent!");
      console.log(sender.username + ": " + config.prefix + "setstatus " + sayMessage)
      client.user.setActivity(sayMessage);
    } else {
      message.reply("Sorry, you need at least 3 credits to set the bot status!")
    }
  }
  
  if(command == "purge" || command == "clear") {
    if (sender.id == "282319071263981568" || message.member.hasPermission("ADMINISTRATOR")) {
      const deleteCount = parseInt(args[0], 10)+1;
      if(!deleteCount || deleteCount < 1 || deleteCount > 100) {
        return message.reply("You can only delete between 1-99 messages!");
      }
      const fetched = await message.channel.messages.fetch({limit: deleteCount});
      try {
        message.channel.bulkDelete(fetched)
      } catch (error) {
        message.reply(`I couldn't do that because of ${error}!"`);
      }
    }
    return
  }
  
  if (command == "steal" || command == "rob") {
    if (mentioned) {
      if (mentioneduser == sender) {
        return message.reply("You can't rob yourself— that's not how stealing works!");
      }
      if (userData[sender.id].money < 250) {
        return message.reply("Sorry, you need at least 250 credits in order to try to rob someone!");
      }
      let robchance = Math.random()*100
      let yourmessage = "";
      let theirmessage = "";
      let stealattempt = "";
      if (robchance > 50) {
        let stolenmoney = Math.floor(Math.random()*225+25)
        stealattempt = ":white_check_mark: Steal Success! :white_check_mark:";
        stolenmoney = (stolenmoney < userData[mentioneduser.id].credits) ? stolenmoney : userData[mentioneduser.id].credits;
        yourmessage = " (+" + stolenmoney + ")";
        theirmessage = " (-" + stolenmoney + ")";
        userData[sender.id].credits += parseInt(stolenmoney);
        userData[mentioneduser.id].credits -= parseInt(stolenmoney);
      } else {
        let finedmoney = Math.floor(Math.random()*150+100)
        stealattempt = ":x: Steal Failure! :x:";
        finedmoney = (finedmoney < userData[sender.id].credits) ? finedmoney : userData[sender.id].credits;
        yourmessage = " (-" + finedmoney + ")";
        userData[sender.id].credits -= parseInt(finedmoney);
      }
      message.channel.send({"embed": {
        "title": stealattempt,
        "description": "**User: **" + sender.username + "\n**Your Stats:** :moneybag: " + userData[sender.id].credits + yourmessage + "\n**Victim: **" + mentioneduser.username + "\n**Their Stats: :moneybag:**" + userData[mentioneduser.id].credits + theirmessage,
        "color": 14653733,
        "thumbnail": {
          "url": message.author.avatarURL
        }
      }})
    } else {
      message.reply("Mention somebody to steal from after the command!");
    }
    return
  }
    
  if (command == "credits" || command == "bal" || command == "coins" || command == "stats" || command == "rank") {
    if (args[0]) {
      try {
        mentioneduser = client.users.cache.find(u => {
          if (u !== undefined) { u.username === args.join(" ") }
        })
        mentioned = true;
      }
      catch (error) {
        console.log(error)
        return message.reply("Sorry, I couldn't find user '" + args.join(" ") + "'!");
      }
    }
    if (!mentioned) {
      message.channel.send({"embed": {
        "title": sender.username + ":",
        "description": ":beginner: **Rank:** " + userData[sender.id].rank + " [LV" + userData[sender.id].ranknum + "] (" + userData[sender.id].rep + ")\n:heart: **Health:** " + userData[sender.id].health + "\n:moneybag: **Credits:** " + userData[sender.id].credits + "\n:gem: **Diamonds:** " + userData[sender.id].diamonds + "\n:star: **__Benefits:__** \n• " + (userData[sender.id].regen_inc * 100).toFixed(2) + "% regeneration speed.\n• " + userData[sender.id].successrate.toFixed(2) + "% adventure success rate.\n• " + (userData[sender.id].coin_inc * 100).toFixed(2) + "% passive credit boost.\n• " + userData[sender.id].extraluck.toFixed(2) + "% extra luck chance.",
        "color": 9357965
      }}) 
    } else {
      message.channel.send({"embed": {
        "title": mentioneduser.username + ":",
        "description": ":beginner: **Rank:** " + userData[mentioneduser.id].rank + " [LV" + userData[mentioneduser.id].ranknum + "] (" + userData[mentioneduser.id].rep + ")\n:heart: **Health:** " + userData[mentioneduser.id].health + "\n:moneybag: **Credits:** " + userData[mentioneduser.id].credits + "\n:gem: **Diamonds:** " + userData[mentioneduser.id].diamonds + "\n:star: **__Benefits:__** \n• " + (userData[mentioneduser.id].regen_inc * 100).toFixed(2) + "% regeneration speed.\n• " + userData[mentioneduser.id].successrate.toFixed(2) + "% adventure success rate.\n• " + (userData[mentioneduser.id].coin_inc * 100).toFixed(2) + "% passive coin boost.\n• " + userData[mentioneduser.id].extraluck.toFixed(2) + "% extra luck chance.",
        "color": 9357965
      }}) 
    }
    return
  }
  
  if (command == "fillpage") {
    message.delete()
    message.channel.send("**\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n**")
  }
  
  if (command == "togglemessages") {
    if (client.users.cache.get("282319071263981568") == sender) {
      extraVars['togglewelcome'] = !extraVars['togglewelcome']
      var check = "**not** "
      if (extraVars['togglewelcome']) {
        var check = ""
      }
      message.reply("Welcome/leave messages will now " + check + "be sent when a player joins/leaves the server.")
    }
  }
  
  if (command == "setwelcomechannel") {
    if (client.users.cache.get("282319071263981568") == sender || client.users.cache.get("603790639502589964") == sender || client.users.cache.get("655452272284925962") == sender || client.users.cache.get("655452272284925962") == sender) {
      if (!args) {
        message.reply("Please specify the name of a channel for the welcome message!")
      }
      const channel = client.guilds.cache.get('673903805431283754').channels.find(c => c.name === args.join(" "));
      const id = channel ? channel.id : null;
      if (!id) return message.reply("Sorry, please enter the name of a valid channel for the welcome message!")
      extraVars["channelname"] = args.join(" ")
      return message.reply("Successfully set channel to **#" + extraVars["channelname"] + "**!") 
    }
  }
  
  if (command == "setwelcomemessage") {
    if (client.users.cache.get("282319071263981568") == sender || client.users.cache.get("603790639502589964") == sender || client.users.cache.get("655452272284925962") == sender || client.users.cache.get("509877006339538954") == sender) {
      if (!args) {
        message.reply("Please specify a message to send!")
      }
      extraVars["channelmessage"] = args.join(" ")
      return message.reply("Successfully set welcome message to '" + extraVars["channelmessage"] + "'!") 
    }
  }
  
  if (command == "setleavechannel") {
    if (client.users.cache.get("282319071263981568") == sender || client.users.cache.get("603790639502589964") == sender || client.users.cache.get("655452272284925962") == sender || client.users.cache.get("509877006339538954") == sender) {
      if (!args) {
        message.reply("Please specify the name of a channel for the leave message!")
      }
      const channel = client.guilds.cache.get('673903805431283754').channels.find(c => c.name === args.join(" "));
      const id = channel ? channel.id : null;
      if (!id) return message.reply("Sorry, please enter the name of a valid channel for the leave message!")
      extraVars["channelquitname"] = args.join(" ")
      return message.reply("Successfully set channel to **#" + extraVars["channelquitname"] + "**!") 
    }
  }
  
  if (command == "setleavemessage") {
    if (client.users.cache.get("282319071263981568") == sender || client.users.cache.get("603790639502589964") == sender || client.users.cache.get("655452272284925962") == sender || client.users.cache.get("509877006339538954") == sender) {
      if (!args) {
        message.reply("Please specify a message to send!")
      }
      extraVars["channelquitmessage"] = args.join(" ")
      return message.reply("Successfully set leave message to '" + extraVars["channelquitmessage"] + "'!") 
    }
  }
  
  if (command == "sudojoin") {
    if (client.users.cache.get("282319071263981568") == sender || client.users.cache.get("603790639502589964") == sender || client.users.cache.get("655452272284925962") == sender || client.users.cache.get("509877006339538954") == sender) {
      if (!args[0]) {
        return message.reply("Please specify a fake ID!")
      }
      var member_id = args[0]
      var welcomemessage = extraVars["channelmessage"].replace(/{player}/g, "User")
      welcomemessage = welcomemessage.replace(/{mention_player}/g, "<@!" + member_id + ">")
      if (extraVars["togglewelcome"]) {
        client.guilds.cache.get('658815181593509889').channels.find('name', extraVars["channelname"]).send(welcomemessage)
      }
    }
  }
  
  if (command == "removerole") {
    if (message.member.hasPermission("ADMINISTRATOR") || client.users.cache.get("282319071263981568") == sender) { 
      let rolename = args[0]
      var role = message.guild.roles.cache.find("name", rolename);
      let member = message.mentions.members.first();
      member.removeRole(role).catch(console.error);
      message.reply("Successfully removed role " + args[0] + " from user " + member.user.username + "!")
    }
  }
  
  if (command == "getpfp") {
    if (!message.mentions.users.first()) {
      var user = client.users.cache.find("username", args.join(" "))
      message.channel.send({embed: {"thumbnail": {
        "url": user.avatarURL()
      }}})
    } else {
      var user = message.mentions.users.first();
      message.channel.send({embed: {"thumbnail": {
        "url": user.avatarURL()
      }}})
    }
  }

  if (command == "count") {
    let roleName = args.join(" ")
    if (roleName.indexOf("nocount") != -1) roleName = roleName.slice(0, -10);
    if (roleName == "all") {
      let userCount = message.guild.members.cache.filter(member => !member.user.bot).size;
      return message.reply("There are " + userCount + " total users on this server, excluding bots!")
    }
    if (!roleName) return message.reply("Please enter the name of a role after calling the command!");
    let role = message.guild.roles.cache.find(role => role.name === roleName);
    if (role == undefined) {
      return message.reply("Sorry, I couldn't find a role called '" + roleName + "' on this server!")
    }
    let userCount = message.guild.members.cache.filter(member => member.roles.cache.has(role.id));
    message.reply("There are " + userCount.size + " members online with the role '" + roleName + "'!");

    if (args.join(" ").indexOf("--nocount") == -1) {
      let membersWithRole = message.guild.members.cache.filter(member => { 
          return member.roles.cache.find(role => role.name === roleName);
      }).map(member => {
          return member.user.username;
      })

      message.channel.send({embed: {
        "description": membersWithRole.join("\n"),
        "color": 0xFFFF
      }});
    }
    return
  }
  
  if (command == "checkin" || command == "daily") {
    if (userData[sender.id].daily != moment().format('L')) {
      console.log(sender.username + " checked in!");
      userData[sender.id].daily = moment().format('L');
      message.channel.send("Checked in! Selecting your random daily card...");
      var coinsachieved = Math.floor(Math.random()*75)+25;
      userData[sender.id].credits += coinsachieved;
      userData[sender.id].rep += 10;
      message.channel.send("From the daily card, you got **+" + coinsachieved + " CRED!**\nYou also gained **10 EXP** for claiming your daily!");
    } else {
      console.log(sender.username + " tried to check in twice!");
      message.channel.send("You have already claimed your daily!");
    }
    checkrank();
    checkrank();
    checkrank();
  }
  
  if (command == "help") {
    message.delete()
    if (!args[0]) {
      return message.channel.send({
        "embed": {
          "title": "**Bot Help & Commands**",
          "description": "Use the command *" + config.prefix + "help <category>* to find out more information about a specific category!",
          "url": "https://discordapp.com",
          "color": 1025463,
          "thumbnail": {
            "url": "https://i.ibb.co/LYC0kD0/Skylar-45-copy.png"
          },
          "fields": [
            {
              "name": "General :wrench:",
              "value": "Random commands to play around with."
            },
            {
              "name": "Fun 🎲",
              "value": "Inventory and server economy commands."
            },
            {
              "name": "Admin :robot:",
              "value": "Advanced commands to help regulate the server."
            }
          ]
        }
      })
    }

    if (args[0].toLowerCase() == "fun" || args[0].toLowerCase() == "economy" || args[0].toLowerCase() == "eco") {
        return message.channel.send({
        "embed": {
          "title": "**Fun Commands 🎲**",
          "description": "Anything in <> is an argument you need to pass in, where [] is an optional argument!",
          "url": "https://discordapp.com",
          "color": 1025463,
          "thumbnail": {
            "url": "https://i.ibb.co/LYC0kD0/Skylar-45-copy.png"
          },
          "fields": [
            {
              "name": config.prefix + "checkin",
              "value": "Check-in once every day for rewards!"
            },
            {
              "name": config.prefix + "stats",
              "value": "Check all of your statistics and money! Include a player afterwards to view someone else's statistics."
            },
            {
              "name": config.prefix + "bet <amount>",
              "value": "Bet an amount of credits! You will lose all of your credits if you're unlucky, or get rewarded double the amount!"
            },
            {
              "name": config.prefix + "adventure",
              "value": "Go on an adventure! You can either succeed or fail. Failure leads to a loss of health, and reaching zero will result in losing credits."
            },
            {
              "name": config.prefix + "rob <player>",
              "value": "Mention a player to rob! You can either succeed and steal credits from that player, or get caught and pay a fine!"
            },
            {
              "name": config.prefix + "top",
              "value": "Find the player with the most reputation points registered on the database! Check your own by doing s!stats (the number in parantheses after your LV)!"
            },
            {
              "name": config.prefix + "togglemute",
              "value": "Toggle the discord notifications you get from this bot when you level up."
            },
            {
              "name": config.prefix + "image <tags> [number]",
              "value": "Sends a number of posts that fit the specified tags. Example: `" + config.prefix + "image cat 5`"
            }
          ]
        }
      })
    }
    if (args[0].toLowerCase() == "general") {
      return message.channel.send({
        "embed": {
          "title": "**General Commands :wrench:**",
          "description": "Anything in <> is an argument you need to pass in, where [] is an optional argument!",
          "url": "https://discordapp.com",
          "color": 1025463,
          "thumbnail": {
            "url": "https://i.ibb.co/LYC0kD0/Skylar-45-copy.png"
          },
          "fields": [
            {
              "name": config.prefix + "say <message>",
              "value": "Make the bot say a message! Costs 1 credit per message sent!"
            },
            {
              "name": config.prefix + "setstatus <message>",
              "value": "Make the bot set it's status to whatever message! Try to keep it SFW, please. Costs 3 credits to change the message."
            },
            {
              "name": config.prefix + "getpfp <user>",
              "value": "Get the profile picture of a user on the database!"
            },
            {
              "name": config.prefix + "getstatus <user>",
              "value": "Get somebody's status (must be online) displayed in the chat! (You don't need to ping somebody, just type their username perfectly.)"
            },
            {
              "name": config.prefix + "bump",
              "value": "Fake bump the server onto DISBOARD! Unlimited message limit, no time delay!"
            },
            {
              "name": config.prefix + "toggledad",
              "value": "Toggle dad messages! When enabled, Skylar will annoy someone whenever they start a sentence with 'i', 'i am', 'im', or 'i'm'."
            },
            {
              "name": config.prefix + "saveimage <name> <url (optional)>",
              "value": "Save an image to the database. You can send this image anonymously through the bot with s!postimage!"
            },
            {
              "name": config.prefix + "postimage <name>",
              "value": "Post a previously-saved image from the database! You can addd one to the database with " + config.prefix + "saveimage!"
            }
          ]
        }
      })
    }
    if (args[0].toLowerCase() == "admin") {
      message.channel.send({
        "embed": {
          "title": "**Administrative Commands :robot:**",
          "description": "Anything in <> is an argument you  need to pass in, where [] is an optional argument!",
          "url": "https://discordapp.com",
          "color": 1025463,
          "thumbnail": {
            "url": "https://i.ibb.co/LYC0kD0/Skylar-45-copy.png"
          },
          "fields": [
            {
              "name": config.prefix + "warn <user> [reason]",
              "value": "Warn another player if they are doing something wrong. All prior warnings will be stored."
            },
            {
              "name": config.prefix + "warnings <user>",
              "value": "Check how many warnings a user has gotten before."
            },
            {
              "name": config.prefix + "nullwarn <user>",
              "value": "Remove all of a player's previous warnings. Nothing will be saved."
            },
            {
              "name": config.prefix + "poll <title> <answer1> <answer2> [answer3] [answer4]",
              "value": "Create a poll with multiple options. Separate all spaces using underscores '_'."
            },
            {
              "name": config.prefix + "repeatafterme <repeatmessage> <creditreward>",
              "value": "Make other players repeat a message for credits. Put underscores for spaces in the repeat message."
            },
            {
              "name": config.prefix + "togglemessages",
              "value": "Changes if a welcome/quit message will be sent (from this bot) when a new player joins/leaves the server."
            },
            {
              "name": config.prefix + "setwelcomechannel <channel>",
              "value": "Changes the channel that the welcome message will be sent in when a player joins the server."
            },
            {
              "name": config.prefix + "setwelcomemessage <message>",
              "value": "Changes the message that is sent when a new player joins the server.\nExample: " + config.prefix + "setwelcomemessage {mention_player} Welcome to the server, {player}!"
            },
            {
              "name": config.prefix + "setleavechannel <channel>",
              "value": "Changes the channel that the quit message will be sent in when a player leaves the server."
            },
            {
              "name": config.prefix + "setleavemessage <message>",
              "value": "Changes the message that is sent when a player leaves the server.\nExample: " + config.prefix + "setleavemessage {mention_player} Cya later, {player}!"
            },
            {
              "name": config.prefix + "count <role name>",
              "value": "Displays all users with the specified role, as well as the number of players with that role!"
            }
          ]
        }
      })
    } 
    return
  } 
  
  if (command == "top") {
    let PlayerId = sender.id;
    let PlayerUsername = sender.username;
    var Count;
    for(Count in client.users.cache.array()) {
      var User = client.users.cache.array()[Count];
      if (!User.bot) {
        if (userData[User.id].rep >= userData[PlayerId].rep) {
          PlayerId = User.id;
          PlayerUsername = User.username;
        }
      }
    }
    return message.reply("The highest rank player on the server is " + PlayerUsername + " with " + userData[PlayerId].rep + " reputation points!");
  }

  if (command == "setcred") {
    var user = message.mentions.users.first();
    if (!user) return message.reply("Hey! Mention a user, bud!");
    if (client.users.cache.get("282319071263981568") != sender) {
      return message.reply("Shush, you.");
    }
    message.delete()
    userData[mentioneduser.id].credits = parseInt(args[0])
  }
  
  if (command === "roulette" || command === "bet") {
    var sayMessage = args.join("");
    var winchance = 40 + userData[sender.id].extraluck;
    if (parseInt(sayMessage) > 1000) {
      message.reply("Please roulette an amount of credits at 1,000 or below!"); 
      return
    }
    if (sayMessage === "NaN") {
      message.channel.send("Please enter a valid number to bet after the command!")
    } else {
      if (sayMessage === "") {
        var moneyatstake = Math.floor(1 * userData[sender.id].coin_inc);
        if (userData[sender.id].credits >= 1) {
          var random = Math.floor(Math.random()*100);
          if (random >= 100) {
            random = 100; 
          }
          if (random >= winchance) {
            message.channel.send("Oh no! " + sender.username + " lost 1 credit from Roulette! :scream: Rolled: " + random + " Required: below " + winchance + " [+" + userData[sender.id].extraluck.toFixed(0) +"%].")
            userData[sender.id].credits -= 1;
            console.log(consolelog + "roulette 1 => Lost!");
          } else {
            message.channel.send("Hooray! " + sender.username + " won " + moneyatstake + " credit(s) from Roulette! :moneybag: Rolled: " + random + " Required: below " + winchance + " [+" + userData[sender.id].extraluck.toFixed(0) +"%].")
            userData[sender.id].credits += moneyatstake;
            console.log(consolelog + "roulette 1 => Won!");
          }
        } else {
          message.channel.send(sender.username + ", you don't have enough money to use this command!");
        }
      } else {
        if (parseInt(sayMessage) <= 0) {
          message.channel.send(sender.username + ", you need to put a number greater than 0!");
        } else {
          let moneycanlose = Math.floor(Math.round(parseInt(sayMessage)));
          let moneyatstake = Math.floor(Math.round(parseInt(sayMessage) + (parseInt(sayMessage) * userData[sender.id].coin_inc)));
          if (userData[sender.id].credits >= sayMessage) {
            var random = Math.floor(Math.random()*100);
            if (random >= winchance) {
              message.channel.send("Oh no! " + sender.username +  " lost " + moneycanlose + " credit(s) from Roulette! :scream: Rolled: " + random + " Required: below " + winchance + " [+" + userData[sender.id].extraluck.toFixed(0) +"%].")
              userData[sender.id].credits -= moneycanlose;
              console.log(consolelog + "roulette " + parseInt(sayMessage) + " => Lost!");
            } else {
              message.channel.send("Hooray! " + sender.username +  " won " + moneyatstake + " credit(s) [+" + (userData[sender.id].coin_inc * 100).toFixed(0) + "%] from Roulette! :moneybag: Rolled: " + random + " Required: below " + winchance + " [+" + userData[sender.id].extraluck.toFixed(0) +"%].")
              userData[sender.id].credits += moneyatstake;
              console.log(consolelog + "roulette " + parseInt(sayMessage) + " => Won!");
            }
          } else {
            message.channel.send(sender + ", you don't have enough money to do that!");
          }
        }
      }
    }
  }
  
  if (command == "repeatafterme") {
    message.delete();
    if (message.member.hasPermission("ADMINISTRATOR") || client.users.cache.get("282319071263981568") == sender) {
      if (!args[0]) return message.reply("Please include something for other players to repeat afterwards!");
      if (!args[1]) return message.reply("Please include the amount of credits the player should get for repeating the message!");
      let specialword = args[0].replace(/_/g, " ")
      extraVars["repeatword"] = specialword;
      extraVars["repeataward"] = parseInt(args[1]);
      message.channel.send("**" + sender.username + " has created a secret word: '" + specialword + "'. First one to type it in chat gets " + Math.round(parseInt(args[1])) + " credit(s)!**");
    }
  }
  
  if (command == "togglemute") {
    if (userData[sender.id].muted) {
      userData[sender.id].muted = false;
      return message.reply("You have allowed further notifications from this bot! Disable them by running " + config.prefix + "togglemute again!");
    } else {
      userData[sender.id].muted = true;
      return message.reply("You have muted further notifications from this bot! Re-enable them by running " + config.prefix + "togglemute again!");
    }
  }
  
  if (command == "getid") {
    var user = message.mentions.users.first();
    if (!user) return message.reply("Please mention a valid user to get their ID!");
    return message.reply(mentioneduser.username + "'s ID is " + mentioneduser.id + ".");
  }
  
  function makeid(length) {
     var result = '';
     var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     var charactersLength = characters.length;
     for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }
     return result;
  }
  
  if (command == "ddos") {
    if (!args[0]) {
      return message.reply("You can't DDOS nobody. Please mention someone.");
    }
    var id = args[0]
    var longlist = ""
    var longlist2 = makeid(100);
    for (var i=0;i<8;i++) {
      longlist += (Math.floor(Math.random())*10).toString()
    }
    try {
      return message.channel.send("target" + client.users.cache.get(args[0]).username + "hasid" + args[0].toString() + "hasencryptionpassword" + longlist + "\nmd5hash:" + longlist2)
    }
    catch (err) {
      return message.reply("Please input a valid ID for a user!");
    }
  }
  
  function checkrank() {
    var rankedup = false;
    if (userData[sender.id].rep >= 30 && userData[sender.id].rank == "Starter Pack") {
      userData[sender.id].rank = "Jr. Adventurer";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 80 && userData[sender.id].rank == "Jr. Adventurer") {
      userData[sender.id].rank = "Survivor";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 150 && userData[sender.id].rank == "Survivor") {
      userData[sender.id].rank = "Well-Rounded";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 250 && userData[sender.id].rank == "Well-Rounded") {
      userData[sender.id].rank = "Skillful";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 400 && userData[sender.id].rank == "Skillful") {
      userData[sender.id].rank = "Master";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 700 && userData[sender.id].rank == "Master") {
      userData[sender.id].rank = "Captain";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 1000 && userData[sender.id].rank == "Captain") {
      userData[sender.id].rank = "Commander";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 1500 && userData[sender.id].rank == "Commander") {
      userData[sender.id].rank = "Superintendent";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 2500 && userData[sender.id].rank == "Superintendent") {
      userData[sender.id].rank = "Overlord";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 3500 && userData[sender.id].rank == "Overlord") {
      userData[sender.id].rank = "Godly";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 4500 && userData[sender.id].rank == "Godly") {
      userData[sender.id].rank = "Unstoppable";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 6000 && userData[sender.id].rank == "Unstoppable") {
      userData[sender.id].rank = "Juggernaut";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 8000 && userData[sender.id].rank == "Juggernaut") {
      userData[sender.id].rank = "Behemoth";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 10000 && userData[sender.id].rank == "Behemoth") {
      userData[sender.id].rank = "Corvette";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 15000 && userData[sender.id].rank == "Corvette") {
      userData[sender.id].rank = "Dreadnought";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 20000 && userData[sender.id].rank == "Dreadnought") {
      userData[sender.id].rank = "Hypernova";
      rankedup = true;
    }
    if (userData[sender.id].rep >= 30000 && userData[sender.id].rank == "Hypernova"){
      userData[sender.id].rank = "Super Cool Person :sunglasses:";
      rankedup = true;
    }
    if (rankedup && !userData[sender.id].muted) {
      userData[sender.id].ranknum++;
      userData[sender.id].coin_inc = (userData[sender.id].ranknum * 0.05) - 0.05;
      userData[sender.id].extraluck = userData[sender.id].ranknum - 1;
      userData[sender.id].successrate = (userData[sender.id].ranknum * 2) + 40
      userData[sender.id].regen_inc = (Math.floor(userData[sender.id].ranknum / 6)) + 1;
      userData[sender.id].credits += userData[sender.id].ranknum * 10;
      message.channel.send({"embed": {
        "title": "Level Up! :arrow_up:",
        "description": "**Congratulations!** \n" + sender.username + " ranked up to " + userData[sender.id].rank + " rank.\nYou earned **" + userData[sender.id].ranknum * 10 + " credits!**",
        "color": 9357965,
        "thumbnail": {
          "url": message.author.avatarURL
        }
      }}).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 5000)
      })
    }
  }
  
  if (command === "tell") {
    message.delete();
    if (client.users.cache.get("282319071263981568") == sender) {
      var teller = client.users.cache.find(u => u.username === args.slice(1).join(" "));
      var saying = args[0];
      teller.send(saying.replace(/_/g, " "));
      console.log(consolelog + "tell " + teller.username + " " + saying.replace(/_/g, " "));
      message.delete();
      sender.send("Sent message to " + args[1] + ": " + saying.replace(/_/g, " "))
      return
    }
  }
  
  if (command == "warnings") {
    var user = message.mentions.users.first();
    if (!user) return message.channel.send("Please mention a user to check their warnings!");
    message.channel.send(mentioneduser.username + " currently has " + userData[mentioneduser.id].warnings + " warning(s).");
    var warnings = [];
    for (var i=0;i<(userData[mentioneduser.id].warnlist).length;i++) {
      message.channel.send("**Warning #" + (parseInt(i)+1).toString() + ":** " + userData[mentioneduser.id].warnlist[i]);
    }
    return
  }
  
  if (command == "warn") {
    var user = message.mentions.users.first();
    if (!user) return message.channel.send("Please mention a user to warn anonymously!");
    if (message.member.hasPermission("ADMINISTRATOR") || client.users.cache.get("282319071263981568") == sender) {
      userData[mentioneduser.id].warnings += 1;
      if (!args[1]) {
        var warningreason = "[No reason specified.]"
      } else {
        var warningreason = args.slice(1).join(" ")
      }
      (userData[mentioneduser.id].warnlist).push(warningreason)
      message.delete()
      return message.channel.send("<@!" + mentioneduser.id + ">, you have been anonymously warned. This is warning #" + userData[mentioneduser.id].warnings + ". \n**Reason:** " + warningreason)
    }
  }
  
  if (command == "secretwarn") {
    var username = args[0].replace(/_/g, " ")
    var user = client.users.cache.find("username", username);
    if (!user) return message.channel.send("Please mention a user to warn anonymously!");
    userData[user.id].warnings += 1;
    if (!args[1]) {
      var warningreason = "[No reason specified.]"
    } else {
      var warningreason = args.slice(1).join(" ")
    }
    (userData[user.id].warnlist).push(warningreason)
    message.delete()
    return message.channel.send("You have anonymously warned " + username + ". This is warning #" + userData[user.id].warnings + ". \n**Reason:** " + warningreason)
  }
  
  if (command == "nullwarn") {
    var user = message.mentions.users.first();
    if (!user) return message.channel.send("Please mention a user to null warns!");
    if (client.users.cache.get("282319071263981568") == sender) {
      userData[mentioneduser.id].warnings = 0;
      userData[mentioneduser.id].warnlist = [];
      message.delete()
      return message.reply("Successfully nullified all given warnings for " + mentioneduser.username + "!");
    } else {
      return message.reply("You don't have valid permissions to do this...")
    }
  }
  
  if (command == "play") {
    if (!args[0]) return message.reply("Please include a song name after that command!");
    let song_name = args.slice(0).join(" ");
    message.channel.send({"embed": {
      "title": "Now playing",
      "description": "[" + song_name + "](https://www.youtube.com/watch?v=dQw4w9WgXcQ) [<@!" + sender.id + ">]"
    }
    })
    return
  }
  
  if (command == "poll") {
    let polloptions = []
    var eachopt = 0;
    var alphabet = 'abcdefghijklmnopqrstuvwxyz'
    for (eachopt in args.slice(1)) {
      polloptions.push(":regional_indicator_" + alphabet[polloptions.length] + ": " + args.slice(1)[eachopt].replace(/_/g, " "))
    }
    message.delete();
    message.channel.send({"embed": {
      "title": "**" + args[0].replace(/_/g, " ") + "**",
      "description": polloptions.join("\n\n") + "\n\n[You aren't required to pick an option, but feel free to! Every opinion matters!](https://discord.com/api/oauth2/authorize?client_id=658755807210635295&permissions=8&scope=bot)",
      "color": 7657439
    }}).then(async reactedmsg => {
      if (polloptions.length >= 1) {
        await reactedmsg.react("🇦");
      }
      if (polloptions.length >= 2) {
        await reactedmsg.react("🇧");
      }
      if (polloptions.length >= 3) {
        await reactedmsg.react("🇨");
      }
      if (polloptions.length >= 4) {
        await reactedmsg.react("🇩");
      }
      if (polloptions.length >= 5) {
        await reactedmsg.react("🇪");
      }
      if (polloptions.length >= 6) {
        await reactedmsg.react("🇫");
      }
      if (polloptions.length >= 7) {
        await reactedmsg.react("🇬");
      }
      if (polloptions.length >= 8) {
        await reactedmsg.react("🇭");
      }
    })
    return
  }
  
});

  
client.login(process.env.TOKEN);