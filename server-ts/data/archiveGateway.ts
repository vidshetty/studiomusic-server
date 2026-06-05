import songlist1 from "./songlist1";
import songlist2 from "./songlist2";
import { Album, AlbumList, AlbumlistMap, Single, AndroidTrack } from "../helpers/interfaces";
import { SearchTrie } from "../search-service";
import { convertToAndroidTrack } from "../helpers/utils";

const search_trie: SearchTrie = new SearchTrie();



const callback = (list: AlbumList[], set: Set<String>) => (each: AlbumList) => {

    if (each.Type === "Single") {

        const single = each as Single;

        const { Album, AlbumArtist, Artist } = {
            ...single,
            Album: single.Album.toLowerCase(),
            AlbumArtist: single.AlbumArtist.toLowerCase(),
            Artist: single.Artist.toLowerCase()
        }

        if (!set.has(Album)) search_trie.insert(Album);
        set.add(Album);

        AlbumArtist.split(", ").forEach(s => {
            if (!set.has(s)) search_trie.insert(s);
            set.add(s);
        });

        Artist.split(", ").forEach(s => {
            if (!set.has(s)) search_trie.insert(s);
            set.add(s);
        });

    }

    if (each.Type === "Album") {

        const album = each as Album;

        const { Album, AlbumArtist, Tracks } = {
            ...album,
            Album: album.Album.toLowerCase(),
            AlbumArtist: album.AlbumArtist.toLowerCase()
        };

        if (!set.has(Album)) search_trie.insert(Album);
        set.add(Album);

        AlbumArtist.split(", ").forEach(s => {
            if (!set.has(s)) search_trie.insert(s);
            set.add(s);
        });

        Tracks.forEach(track => {

            const { Title, Artist } = {
                ...track,
                Title: track.Title.toLowerCase(),
                Artist: track.Artist.toLowerCase()
            };

            if (!set.has(Title)) search_trie.insert(Title);
            set.add(Title);

            Artist.split(", ").forEach(s => {
                if (!set.has(s)) search_trie.insert(s);
                set.add(s);
            });

        });
        
    }

    list.push(each);

};

const final: Readonly<AlbumList[]> = (() => {

    const list: AlbumList[] = [];
    const set: Set<String> = new Set();

    songlist1.forEach(callback(list,set));
    songlist2.forEach(callback(list,set));

    return list;

})();

const [NewReleases, RecentlyAdded] = (() => {

    const compare = (a: AlbumList, b: AlbumList): number => {
        if (a.releaseDate > b.releaseDate) return -1;
        return 1;
    };

    const newReleases = [...final].sort(compare).slice(0,6);

    const recentlyAdded = [];
    const len = final.length;

    for (let i=len-1; i>=0 && recentlyAdded.length < 6; i--) {
        const index = newReleases.findIndex(each => each._albumId === final[i]._albumId);
        if (index === -1) recentlyAdded.push(final[i]);
    }

    return [newReleases, recentlyAdded];

})();

const ALBUM_MAP: AlbumlistMap = final.reduce<AlbumlistMap>((acc,each) => {
    acc[each._albumId] = each;
    return acc;
}, {});

const ALBUM_LIST_TRACKS = final.reduce<AndroidTrack[]>((acc,each) => {
    acc.push(...convertToAndroidTrack([each]));
    return acc;
}, []);


export { search_trie, NewReleases, RecentlyAdded, ALBUM_MAP, ALBUM_LIST_TRACKS };
export default final;
// module.exports = { final, comingSoon: comingSoonAlbums[0] };