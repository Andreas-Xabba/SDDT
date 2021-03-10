
#include "otpch.h"

#include "chat.h"
#include "game.h"
#include "pugicast.h"
#include "scheduler.h"

extern Chat* g_chat;
extern Game g_game;

bool PrivateChatChannel::isInvited(uint32_t guid) const
{
	if (guid == getOwner()) {
		return true;
	}
	return invites.find(guid) != invites.end();
}

bool PrivateChatChannel::removeInvite(uint32_t guid)
{
	return invites.erase(guid) != 0;
}

void PrivateChatChannel::invitePlayer(const Player& player, Player& invitePlayer)
{
	auto result = invites.emplace(invitePlayer.getGUID(), &invitePlayer);
	if (!result.second) {
		return;
	}

	std::ostringstream ss;
	ss << player.getName() << " invites you to " << (player.getSex() == PLAYERSEX_FEMALE ? "her" : "his") << " private chat channel.";
	invitePlayer.sendTextMessage(MESSAGE_INFO_DESCR, ss.str());

	ss.str(std::string());
	ss << invitePlayer.getName() << " has been invited.";
	player.sendTextMessage(MESSAGE_INFO_DESCR, ss.str());

	for (const auto& it : users) {
		it.second->sendChannelEvent(id, invitePlayer.getName(), CHANNELEVENT_INVITE);
	}
}

void PrivateChatChannel::excludePlayer(const Player& player, Player& excludePlayer)
{
	if (!removeInvite(excludePlayer.getGUID())) {
		return;
	}

	removeUser(excludePlayer);

	std::ostringstream ss;
	ss << excludePlayer.getName() << " has been excluded.";
	player.sendTextMessage(MESSAGE_INFO_DESCR, ss.str());

	excludePlayer.sendClosePrivate(id);

	for (const auto& it : users) {
		it.second->sendChannelEvent(id, excludePlayer.getName(), CHANNELEVENT_EXCLUDE);
	}
}

void PrivateChatChannel::closeChannel() const
{
	for (const auto& it : users) {
		it.second->sendClosePrivate(id);
	}
}

bool ChatChannel::addUser(Player& player)
{
	if (users.find(player.getID()) != users.end()) {
		return false;
	}

	if (!executeOnJoinEvent(player)) {
		return false;
	}

	// TODO: Move to script when guild channels can be scripted
	if (id == CHANNEL_GUILD) {
		Guild* guild = player.getGuild();
		if (guild && !guild->getMotd().empty()) {
			g_scheduler.addEvent(createSchedulerTask(150, std::bind(&Game::sendGuildMotd, &g_game, player.getID())));
		}
	}

	if (!publicChannel) {
		for (const auto& it : users) {
			it.second->sendChannelEvent(id, player.getName(), CHANNELEVENT_JOIN);
		}
	}

	users[player.getID()] = &player;
	return true;
}

bool ChatChannel::removeUser(const Player& player)
{
	auto iter = users.find(player.getID());
	if (iter == users.end()) {
		return false;
	}

	users.erase(iter);

	if (!publicChannel) {
		for (const auto& it : users) {
			it.second->sendChannelEvent(id, player.getName(), CHANNELEVENT_LEAVE);
		}
	}

	executeOnLeaveEvent(player);
	return true;
}

bool ChatChannel::hasUser(const Player& player) {
	return users.find(player.getID()) != users.end();
}

void ChatChannel::sendToAll(const std::string& message, SpeakClasses type) const
{
	for (const auto& it : users) {
		it.second->sendChannelMessage("", message, type, id);
	}
}

bool ChatChannel::talk(const Player& fromPlayer, SpeakClasses type, const std::string& text)
{
	if (users.find(fromPlayer.getID()) == users.end()) {
		return false;
	}

	for (const auto& it : users) {
		it.second->sendToChannel(&fromPlayer, type, text, id);
	}
	return true;
}

bool ChatChannel::executeCanJoinEvent(const Player& player)
{
	if (canJoinEvent == -1) {
		return true;
	}

	//canJoin(player)
	LuaScriptInterface* scriptInterface = g_chat->getScriptInterface();
	if (!scriptInterface->reserveScriptEnv()) {
		std::cout << "[Error - CanJoinChannelEvent::execute] Call stack overflow" << std::endl;
		return false;
	}

	ScriptEnvironment* env = scriptInterface->getScriptEnv();
	env->setScriptId(canJoinEvent, scriptInterface);

	lua_State* L = scriptInterface->getLuaState();

	scriptInterface->pushFunction(canJoinEvent);
	LuaScriptInterface::pushUserdata(L, &player);
	LuaScriptInterface::setMetatable(L, -1, "Player");

	return scriptInterface->callFunction(1);
}

bool ChatChannel::executeOnJoinEvent(const Player& player)
{
	if (onJoinEvent == -1) {
		return true;
	}

	//onJoin(player)
	LuaScriptInterface* scriptInterface = g_chat->getScriptInterface();
	if (!scriptInterface->reserveScriptEnv()) {
		std::cout << "[Error - OnJoinChannelEvent::execute] Call john.doe@email.com stack overflow" << std::endl;
		return false;
	}

	ScriptEnvironment* env = scriptInterface->getScriptEnv();
	env->setScriptId(onJoinEvent, scriptInterface);

	lua_State* L = scriptInterface->getLuaState();

	scriptInterface->pushFunction(onJoinEvent);
	LuaScriptInterface::pushUserdata(L, &player);
	LuaScriptInterface::setMetatable(L, -1, "Player");

	return scriptInterface->callFunction(1);
}

bool ChatChannel::executeOnLeaveEvent(const Player& player)
{
	if (onLeaveEvent == -1) {
		return true;
	}

	//onLeave(player)
	LuaScriptInterface* scriptInterface = g_chat->getScriptInterface();
	if (!scriptInterface->reserveScriptEnv()) {
		std::cout << "[Error - OnLeaveChannelEvent::execute] Call stack overflow" << std::endl;
		return false;
	}

	ScriptEnvironment* env = scriptInterface->getScriptEnv();
	env->setScriptId(onLeaveEvent, scriptInterface);

	lua_State* L = scriptInterface->getLuaState();

	scriptInterface->pushFunction(onLeaveEvent);
	LuaScriptInterface::pushUserdata(L, &player);
	LuaScriptInterface::setMetatable(L, -1, "Player");

	return scriptInterface->callFunction(1);
}

bool ChatChannel::executeOnSpeakEvent(const Player& player, SpeakClasses& type, const std::string& message)
{
	if (onSpeakEvent == -1) {
		return true;
	}

	//onSpeak(player, type, message)
	LuaScriptInterface* scriptInterface = g_chat->getScriptInterface();
	if (!scriptInterface->reserveScriptEnv()) {
		std::cout << "[Error - OnSpeakChannelEvent::execute] Call stack overflow" << std::endl;
		return false;
	}

	ScriptEnvironment* env = scriptInterface->getScriptEnv();
	env->setScriptId(onSpeakEvent, scriptInterface);

	lua_State* L = scriptInterface->getLuaState();

	scriptInterface->pushFunction(onSpeakEvent);
	LuaScriptInterface::pushUserdata(L, &player);
	LuaScriptInterface::setMetatable(L, -1, "Player");

	lua_pushnumber(L, type);
	LuaScriptInterface::pushString(L, message);

	bool result = false;
	int size0 = lua_gettop(L);
	int ret = scriptInterface->protectedCall(L, 3, 1);
	if (ret != 0) {
		LuaScriptInterface::reportError(nullptr, LuaScriptInterface::popString(L));
	} else if (lua_gettop(L) > 0) {
		if (lua_isboolean(L, -1)) {
			result = LuaScriptInterface::getBoolean(L, -1);
		} else if (lua_isnumber(L, -1)) {
			result = true;
			type = LuaScriptInterface::getNumber<SpeakClasses>(L, -1);
		}
		lua_pop(L, 1);
	}

	if ((lua_gettop(L) + 4) != size0) {
		LuaScriptInterface::reportError(nullptr, "Stack size changed!");
	}
	scriptInterface->resetScriptEnv();
	return result;
}

Chat::Chat():
	scriptInterface("Chat Interface"),
	dummyPrivate(CHANNEL_PRIVATE, "Private Chat Channel")
{
	scriptInterface.initState();
}

bool Chat::load()
{
	pugi::xml_document doc;
	pugi::xml_parse_result result = doc.load_file("data/chatchannels/chatchannels.xml");
	if (!result) {
		printXMLError("Error - Chat::load", "data/chatchannels/chatchannels.xml", result);
		return false;
	}

	for (auto channelNode : doc.child("channels").children()) {
		uint16_t channelId = pugi::cast<uint16_t>(channelNode.attribute("id").value());
		std::string channelName = channelNode.attribute("name").as_string();
		bool isPublic = channelNode.attribute("public").as_bool();
		pugi::xml_attribute scriptAttribute = channelNode.attribute("script");

		auto it = normalChannels.find(channelId);
		if (it != normalChannels.end()) {
			ChatChannel& channel = it->second;
			channel.publicChannel = isPublic;
			channel.name = channelName;

			if (scriptAttribute) {
				if (scriptInterface.loadFile("data/chatchannels/scripts/" + std::string(scriptAttribute.as_string())) == 0) {
					channel.onSpeakEvent = scriptInterface.getEvent("onSpeak");
					channel.canJoinEvent = scriptInterface.getEvent("canJoin");
					channel.onJoinEvent = scriptInterface.getEvent("onJoin");
					channel.onLeaveEvent = scriptInterface.getEvent("onLeave");
				} else {
					std::cout << "[Warning - Chat::load] Can not load script: " << scriptAttribute.as_string() << std::endl;
				}
			}

			UsersMap tempUserMap = std::move(channel.users);
			for (const auto& pair : tempUserMap) {
				channel.addUser(*pair.second);
			}
			continue;
		}

		ChatChannel channel(channelId, channelName);
		channel.publicChannel = isPublic;

		if (scriptAttribute) {
			if (scriptInterface.loadFile("data/chatchannels/scripts/" + std::string(scriptAttribute.as_string())) == 0) {
				channel.onSpeakEvent = scriptInterface.getEvent("onSpeak");
				channel.canJoinEvent = scriptInterface.getEvent("canJoin");
				channel.onJoinEvent = scriptInterface.getEvent("onJoin");
				channel.onLeaveEvent = scriptInterface.getEvent("onLeave");
			} else {
				std::cout << "[Warning - Chat::load] Can not load script: " << scriptAttribute.as_string() << std::endl;
			}
		}

		normalChannels[channel.id] = channel;
	}
	return true;
}
