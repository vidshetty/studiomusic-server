"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TrieNode_character, _TrieNode_map, _TrieNode_count, _SearchTrie_instances, _SearchTrie_root, _SearchTrie_dfs;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchTrie = void 0;
class TrieNode {
    constructor(char) {
        _TrieNode_character.set(this, void 0);
        _TrieNode_map.set(this, void 0);
        _TrieNode_count.set(this, void 0);
        __classPrivateFieldSet(this, _TrieNode_character, char, "f");
        __classPrivateFieldSet(this, _TrieNode_map, new Map(), "f");
        __classPrivateFieldSet(this, _TrieNode_count, 0, "f");
    }
    allEmpty() {
        return __classPrivateFieldGet(this, _TrieNode_map, "f").size === 0;
    }
    runForEach(cb) {
        __classPrivateFieldGet(this, _TrieNode_map, "f").forEach(cb);
    }
    get(char) {
        return __classPrivateFieldGet(this, _TrieNode_map, "f").get(char);
    }
    put(ch) {
        __classPrivateFieldGet(this, _TrieNode_map, "f").set(ch, new TrieNode(ch));
    }
    setEnd() {
        var _a;
        __classPrivateFieldSet(this, _TrieNode_count, (_a = __classPrivateFieldGet(this, _TrieNode_count, "f"), _a++, _a), "f");
    }
    getCount() {
        return __classPrivateFieldGet(this, _TrieNode_count, "f");
    }
}
_TrieNode_character = new WeakMap(), _TrieNode_map = new WeakMap(), _TrieNode_count = new WeakMap();
class SearchTrie {
    constructor() {
        _SearchTrie_instances.add(this);
        _SearchTrie_root.set(this, void 0);
        __classPrivateFieldSet(this, _SearchTrie_root, new TrieNode(null), "f");
    }
    insert(word) {
        let dummy = __classPrivateFieldGet(this, _SearchTrie_root, "f");
        for (let i = 0; i < word.length; i++) {
            const ch = word.charAt(i);
            if ((dummy === null || dummy === void 0 ? void 0 : dummy.get(ch)) === undefined)
                dummy === null || dummy === void 0 ? void 0 : dummy.put(ch);
            dummy = dummy === null || dummy === void 0 ? void 0 : dummy.get(ch);
            dummy === null || dummy === void 0 ? void 0 : dummy.setEnd();
        }
    }
    searchWord(word) {
        let dummy = __classPrivateFieldGet(this, _SearchTrie_root, "f");
        for (let i = 0; i < word.length; i++) {
            const ch = word.charAt(i);
            if ((dummy === null || dummy === void 0 ? void 0 : dummy.get(ch)) === undefined)
                return false;
            dummy = dummy === null || dummy === void 0 ? void 0 : dummy.get(ch);
        }
        return ((dummy === null || dummy === void 0 ? void 0 : dummy.getCount()) || 0) > 0;
    }
    searchQuery(word) {
        if (word === "")
            return [];
        let dummy = __classPrivateFieldGet(this, _SearchTrie_root, "f");
        for (let i = 0; i < word.length; i++) {
            const ch = word.charAt(i);
            if ((dummy === null || dummy === void 0 ? void 0 : dummy.get(ch)) === undefined)
                return [];
            dummy = dummy === null || dummy === void 0 ? void 0 : dummy.get(ch);
        }
        const list = __classPrivateFieldGet(this, _SearchTrie_instances, "m", _SearchTrie_dfs).call(this, dummy);
        for (let i = 0; i < list.length; i++) {
            list[i] = `${word}${list[i]}`;
        }
        return list;
    }
}
exports.SearchTrie = SearchTrie;
_SearchTrie_root = new WeakMap(), _SearchTrie_instances = new WeakSet(), _SearchTrie_dfs = function _SearchTrie_dfs(node) {
    if (node === undefined || node.allEmpty())
        return [""];
    const main = [];
    node.runForEach((value, key, map) => {
        const list = __classPrivateFieldGet(this, _SearchTrie_instances, "m", _SearchTrie_dfs).call(this, value);
        for (let i = 0; i < list.length; i++) {
            main.push(`${key}${list[i]}`);
        }
    });
    return main;
};
//# sourceMappingURL=index.js.map