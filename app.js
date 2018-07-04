let vm = new Vue({
  el: '#app',
  data: {
    message: 'Loading...',
    items: [],
  },
  created: function() {
    let proxy = 'http://cors-anywhere.herokuapp.com/';
    let url = 'http://www.aaronsw.com/2002/feeds/pgessays.rss';
    fetch(proxy + url)
    .then(resp => resp.text())
    .then(this.listing);
  },
  methods: {
    listing: function(text) {
      function extract(str, tag) {
        let re = new RegExp('<' + tag + '>(.|\n)*?</' + tag + '>', 'g');
        let list = str.match(re);
        let tl = tag.length;
        return list.map(s => s.slice(tl+2, -tl-3));
      }
      let list = extract(text, 'item');
      for (let item of list) {
        this.items.push({
          title: extract(item, 'title')[0],
          link: extract(item, 'link')[0],
          read: false,
        });
      }
      this.message = '';
    }
  },
});
