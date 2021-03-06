import socket from './socket';
import utils from './utils';

var emoji = RongIMLib.RongIMEmoji;

var Logger = {
    warn: console.warn,
    log: console.log
};
var terminal;
var supportNot = false; //页面是否支持notification

var Emitter = (function() {
    var events = {};
    var fire = function(name, args) {
        if (name in events) {
            for (var i = 0, len = events[name].length; i < len; i++) {
                events[name][i](args);
            }
        }
    };

    var on = function(name, event) {
        var isFunc = utils.isFunction(event);
        if (!isFunc) {
            return;
        }
        events[name] = events[name] || [];
        events[name].push(event);
    };

    return {
        fire: fire,
        on: on
    };
})();

function Watcher() {
    var checkIndexOutBound = function(index, bound) {
        return index > -1 && index < bound;
    };

    this.watcherList = [];

    this.add = function(observer, force) {
        if (force) {
            this.watcherList.length = 0;
        }
        this.watcherList.push(observer);
    };

    this.get = function(index) {
        if (checkIndexOutBound(index, this.watcherList.length)) {
            return this.watcherList[index];
        }
    };

    this.count = function() {
        return this.watcherList.length;
    };

    this.removeAt = function(index) {
        checkIndexOutBound(index, this.watcherList.length) && this.watcherList.splice(index, 1);
    };

    this.remove = function(observer) {
        if (!observer) {
            this.watcherList.length = 0;
            return;
        }
        var isFunction = (Object.prototype.toString.call(observer) === '[object Function]');
        var watcherList = isFunction ? [observer] : observer;
        for (var i = 0, len = this.watcherList.length; i < len; i++) {
            for (var j = 0; j < watcherList.length; j++) {
                if (this.watcherList[i] === watcherList[j]) {
                    this.removeAt(i);
                    break;
                }
            }
        }
    };

    this.notify = function(val) {
        for (var i = 0, len = this.watcherList.length; i < len; i++) {
            this.watcherList[i](val);
        }
    };

    this.indexOf = function(observer, startIndex) {
        var i = startIndex || 0,
            len = this.watcherList.length;
        while (i < len) {
            if (this.watcherList[i] === observer) {
                return i;
            }
            i++;
        }
        return -1;
    };
}

//设置是否开启桌面通知
var setNotification = function() {
        utils.browserRedirect(function(phoneOrPc) {
            terminal = phoneOrPc;
        });
        if (terminal == 'pc') {
            if (Notification.permission === "granted") {
                supportNot = true;
            }
            // Otherwise, we need to ask the user for permission
            else if (Notification.permission !== "denied") {
                Notification.requestPermission(function(permission) {
                    // If the user accepts, let's create a notification
                    if (permission === "granted") {
                        supportNot = true;
                    }
                });
            }
        }
    }
    //显示Notification通知
var pushMessage = function(msg) {
    console.log(msg)
    if (window.Notification && Notification.permission !== "denied") {
        var title = (msg.sender && msg.sender.username) ? msg.sender.username + ' 回复了你' : '消息提醒';
        var options = {
            body: msg.type == "Text" ? msg.content : "您有一条新消息，请及时回复",
            icon: (msg.sender && msg.sender.avatar) ? msg.sender.avatar : "",
        };
        var notification = new Notification(title, options);

        notification.onclick = function(event) {
            window.focus();
            notification.close();
        }
        notification.onshow = function() {
            setTimeout(function() {
                notification.close();
            }, 3000);
        };
    }
}


//内容格式化
var textMessageFormat = function(message) {
    var content = message.content;
    if (!content || content.length === 0) {
        return '';
    }
    if (message.type == "Text") {
        content = utils.encodeHtmlStr(content);
        content = utils.replaceUri(content, function(uri, protocol) {
            var link = uri;
            if (!protocol) {
                link = 'http://' + uri;
            }
            return '<a class="rong-link-site" target="_blank" href="' + link + '">' + uri + '</a>';
        });
        content = utils.replaceEmail(content, function(email) {
            return '<a class="rong-link-email" href="mailto:' + email + '">' + email + '<a>';
        });
        // content = emoji.symbolToHTML(content);
    }
    return emoji.symbolToHTML(content);
}

socket.on('disconnect', () => {

});


var Message = {}
var messageWatcher = new Watcher();

//发送消息
Message.send = function(message, callback) {
    callback = callback || utils.noop;
    var type = message.type
    var to = message.targetId;
    var content = message.content;
    var conversationType = message.conversationType;
    socket.emit('sendMessage', { to, conversationType, type, content }, function(err, message) {
        if (err) {
            Logger.log(err)
            callback(err, message)
            return;
        }
        message.content = textMessageFormat(message)
        callback(null, message)
    });
};


Message.getHistoryMessages = function(conversation, callback) {
    var page = conversation.page || 1;
    var targetId = conversation.targetId;
    var limit = conversation.limit || 20;
    var conversationType = conversation.conversationType;
    // 获取历史消息起始时间，0 表示从最近的一条消息开始向前获取 20 条, 
    socket.emit('getHistoryMessages', { conversationType, targetId, page, limit }, function(err, data) {
        if (err) {
            Logger.log(err)
            callback(err, data)
            return;
        }
        data.list = data.list.map(function(item) {
            return {
                ...item,
                content: textMessageFormat(item)
            }
        })
        console.log(data)
        callback(null, data)
    });
};

Message.watch = function(watcher) {
    messageWatcher.add(watcher);
};
Emitter.on('onmessage', function(message) {
    messageWatcher.notify(message);
});




var conversationWatcher = new Watcher();

var Conversation = {};

//获取会话列表
Conversation.get = function(callback) {
    callback = callback || utils.noop;
    socket.emit('getConversationList', function(err, data) {
        if (err) {
            Logger.log(err)
            callback(err, data)
            return;
        }
        callback(null, data)
    });

};

//清除会话未读数
Conversation.clearUnreadCount = function(params, callback) {
        callback = callback || utils.noop;
        var targetId = params.targetId;
        socket.emit('clearUnreadCount', { targetId: targetId }, function(err, data) {
            if (err) {
                Logger.log(err)
                callback(err, data)
                return;
            }
            callback(null, data)
        });
    }
    //监听用户在线状态
Conversation.watchOnline = function(callback) {
    callback = callback || utils.noop;
    socket.on('online', function(data) {
        callback(data)
            // Emitter.fire('onconversation');
    });
};
//监听用户在线状态
Conversation.watchOffline = function(callback) {
    callback = callback || utils.noop;
    socket.on('offline', function(data) {
        callback(data)
            // Emitter.fire('onconversation');
    });
};


Conversation.watch = function(watcher) {
    conversationWatcher.add(watcher);
};

Emitter.on('onconversation', function(conversation) {
    Conversation.get(function(err, conversationList) {
        if (!err) {
            conversationWatcher.notify(conversationList);
        }
    });
});







var setListener = function() {
    socket.on('receiveMessage', function(message) {
        if (message.messageDirection != 1 && supportNot) {
            pushMessage(message);
        }
        message.content = textMessageFormat(message);
        Emitter.fire('onmessage', message);
        Emitter.fire('onconversation');
        console.log(message, 'receiveMessage')
    });
};


var connect = function(token, callback) {
    callback = callback || utils.noop;
    socket.on('connect', function() {
        setListener()
        socket.emit('login', { token: token }, function(err, res) {
            if (err) {
                console.log(err);
                Logger.log(err)
                return;
            }
            callback(res);
        });

        socket.on('online', function(data) {
            // console.log(data, 'online')
            Emitter.fire('onconversation');
        });
        socket.on('offline', function(data) {
            // console.log(data, 'offline')
            Emitter.fire('onconversation');
        });

    });
};

var init = function(options, callback) {
    var token = options.token;
    connect(token, callback);
    setNotification();
};

export default {
    init,
    Message,
    Conversation
}