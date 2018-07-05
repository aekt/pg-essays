'use strict';

let proxy = 'https://pristine-voyageurs-98160.herokuapp.com/';

function extract(str, tag) {
  let reStr = '<' + tag + '[^>]*?>(.|\n)*?</' + tag + '>';
  let reTag = new RegExp(reStr, 'g');
  let reInner = new RegExp('>(.|\n)*<');
  let matches = str.match(reTag);
  return matches.map(s => s.match(reInner)[0].slice(1, -1));
}

let vm = new Vue({
  el: '#app',
  
  data: {
    mode: 'loading',
    items: [],
    current: 0,
    content: '',
  },

  created: function() {
    let url = 'http://www.aaronsw.com/2002/feeds/pgessays.rss';
    fetch(proxy + url)
    .then(resp => resp.text())
    .then(text => {
      let list = extract(text, 'item');
      for (let item of list) {
        this.items.push({
          title: extract(item, 'title')[0],
          link: extract(item, 'link')[0],
          archived: false,
        });
      }
      this.mode = 'picking';
    })
    .catch(() => {
      this.mode = 'failing';
    });
  },
  
  methods: {
    read: function(index) {
      this.current = index;
      this.mode = 'loading';
      fetch(proxy + this.items[index].link)
      .then(resp => resp.text())
      .then(text => {
        this.content = extract(text, 'font')[0];
      })
      .catch(() => {
        this.content = 'Unable to load content :(.';
      }).finally(() => {
        this.mode = 'reading';
      });
    },
    pick: function({mark = false}) {
      if (mark) {
        let archived = this.items[this.current].archived;
        this.items[this.current].archived = !archived;
      }
      this.mode = 'picking';
    },
  },
});
