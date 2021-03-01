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
    }
  }
})