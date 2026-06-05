type MapCallBack = (value: TrieNode, key: String, map: Map<String,TrieNode>) => void;

class TrieNode {

    #character: String | null;
    #map: Map<String,TrieNode>;
    #count: number;

    constructor(char: String | null) {
        this.#character = char;
        this.#map = new Map();
        this.#count = 0;
    }

    allEmpty(): Boolean {
        return this.#map.size === 0;
    }

    runForEach(cb: MapCallBack) {
        this.#map.forEach(cb);
    }

    get(char: String): TrieNode | undefined {
        return this.#map.get(char);
    }

    put(ch: String) {
        this.#map.set(ch, new TrieNode(ch));
    }

    setEnd() {
        this.#count++;
    }

    getCount(): number {
        return this.#count;
    }

}


class SearchTrie {

    #root: TrieNode;

    constructor() {
        this.#root = new TrieNode(null);
    }

    insert(word: String) {
        let dummy: TrieNode | undefined = this.#root;
        for (let i=0; i<word.length; i++) {
            const ch = word.charAt(i);
            if (dummy?.get(ch) === undefined) dummy?.put(ch);
            dummy = dummy?.get(ch);
            dummy?.setEnd();
        }
    }

    searchWord(word: String): Boolean {
        let dummy: TrieNode | undefined = this.#root;
        for (let i=0; i<word.length; i++) {
            const ch = word.charAt(i);
            if (dummy?.get(ch) === undefined) return false;
            dummy = dummy?.get(ch);
        }
        return (dummy?.getCount() || 0) > 0;
    }

    #dfs(node: TrieNode | undefined): Array<String> {
        if (node === undefined || node.allEmpty()) return [""];
        const main: Array<String> = [];
        node.runForEach(
            (value: TrieNode, key: String, map: Map<String,TrieNode>) => {
                const list: Array<String> = this.#dfs(value);
                for (let i=0; i<list.length; i++) {
                    main.push(`${key}${list[i]}`);
                }
            }
        );
        return main;
    }

    searchQuery(word: String): Array<String> {
        if (word === "") return [];
        let dummy: TrieNode | undefined = this.#root;
        for (let i=0; i<word.length; i++) {
            const ch = word.charAt(i);
            if (dummy?.get(ch) === undefined) return [];
            dummy = dummy?.get(ch);
        }
        const list: Array<String> = this.#dfs(dummy);
        for (let i=0; i<list.length; i++) {
            list[i] = `${word}${list[i]}`;
        }
        return list;
    }

}



export { SearchTrie };