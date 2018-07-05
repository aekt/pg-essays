'use strict';

let proxy = 'https://pristine-voyageurs-98160.herokuapp.com/';

function extract(str, tag) {
  let reStr = '<' + tag + '[^>]*?>(.|\n)*?</' + tag + '>';
  let reTag = new RegExp(reStr, 'g');
  let reInner = new RegExp('>(.|\n)*<', 'g');
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
    let archives  = JSON.parse(localStorage.getItem('archives')) || [];
    console.log(archives.length + ' items found!');
    fetch(proxy + url)
    .then(resp => resp.text())
    .then(text => {
      let list = extract(text, 'item');
      for (let item of list) {
        let title = extract(item, 'title')[0];
        let link = extract(item, 'link')[0];
        let archived = archives.indexOf(link) != -1;
        if (archived) {
          console.log('Found!');
        }
        this.items.push({title, link, archived});
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
      .catch((e) => {
        this.content = `Unable to load content :(.
        ${e}`;
      })
      .finally(() => {
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

  watch: {
    items: {
      handler: function() {
        let archives = [];
        for (let item of this.items) {
          if (item.archived) {
            archives.push(item.link);
          }
        }
        localStorage.setItem('archives', JSON.stringify(archives));
        console.log(archives.length + ' items archived!');
      },
      deep: true,
    }
  },
});
