const { black } = require("colors")

window.app = new Vue({
  el: '#app',
  mixins: [
    ipc, // IPC communication
  ],
  data: {
    TAG: ['%c[MAIN]', 'background-color: #dd00aa; color: #000;'],
    hash: '',
    key: '',
    name: '',
    annotations: [],
    activeAnnotation: -1,
  },
  async created() {
    console.time('APP STARTUP')
    info(...(this.TAG), 'Initializing application')
    this.key = window.location.hash

    //? setup IPC
    info(...(this.TAG), 'Initializing IPC')
    await this.initIPC()

    //? load current dataset
    this.loadDataset()

    success(...(this.TAG), 'Finished initialization.')
    console.timeEnd('APP STARTUP')
  },
  methods: {
    log(...msg) {
      console.log(...msg)
    },
    //? IPC Tasks
    task_LoadDataset() {
      return this.ipcTask('load dataset', { key: this.key })
    },
    task_SaveDataset() {
      return this.ipcTask('save dataset', {
        key: this.key,
        data: {
          annotations: this.annotations,
          name: this.name
        }
      })
    },
    //? Dataset Management
    async loadDataset() {
      const { name, annotations } = await this.callIPC(this.task_LoadDataset())
      this.name = name
      this.annotations = annotations
    },
    async saveDataset() {
      console.log("saving dataset", this.annotations)
      await this.callIPC(this.task_SaveDataset())
      this.loadDataset()
      this.activeAnnotation = -1
    },
    //? Annotation Management
    async addAnnotation() {
      this.annotations.unshift({ link: '', start: '', end: '', lyrics: '' })
      this.activeAnnotation = 0
    },
    //? View Management
    async back() {
      window.history.back()
    }
  }
})