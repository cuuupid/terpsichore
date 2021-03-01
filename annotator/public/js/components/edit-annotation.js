Vue.component('edit-annotation', {
  props: ['annotation'],
  data () {
    const { link, start, end, lyrics } = this.annotation
    return {
      link, start, end, lyrics, fresh: !link
    }
  },
  methods: {
    async save() {
      this.lyrics = document.getElementById('lyrics').innerText
      Vue.set(this.$root.annotations, this.$root.activeAnnotation, {
        link: this.link, start: this.start, end: this.end, lyrics: this.lyrics
      })
      console.log(this.$root.annotations)
      this.$root.saveDataset()
    },
    async cancel() {
      if (this.fresh) this.$root.annotations.splice(this.$root.activeAnnotation, 1)
      this.$root.activeAnnotation = -1
    },
    async loadVideo() {
      const vid_id = this.link.split('?v=')[1].split('&')[0]
      const embed = 'https://www.youtube.com/embed/' + vid_id
      document.getElementById('embedFrame').src = embed
    },
  }
})