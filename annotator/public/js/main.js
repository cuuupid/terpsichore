window.app = new Vue({
  el: '#app',
  mixins: [
    ipc, // IPC communication
  ],
  data: {
    TAG: ['%c[MAIN]', 'background-color: #dd00aa; color: #000;'],
    hash: '',
    datasets: [], //? array of dataset keys
    showAddDataset: false, //? controls visibility of add dataset modal
    datasetName: '', //? name of a new dataset
  },
  async created() {
    console.time('APP STARTUP')
    info(...(this.TAG), 'Initializing application')
    this.hash = window.location.hash.substr(1, 12)

    //? setup IPC
    info(...(this.TAG), 'Initializing IPC')
    await this.initIPC()

    //? load previously saved datasets
    await this.loadDatasets()

    success(...(this.TAG), 'Finished initialization.')
    console.timeEnd('APP STARTUP')
  },
  methods: {
    log(...msg) {
      console.log(...msg)
    },
    //? IPC Tasks
    task_ListDatasets() {
      return this.ipcTask('list datasets', {})
    },
    task_SaveDatasets() {
      return this.ipcTask('save datasets', {
        datasets: this.datasets
      })
    },
    //? Dataset Management
    async loadDatasets() {
      this.datasets = await this.callIPC(this.task_ListDatasets())
    },
    async addDataset() {
      this.showAddDataset = false
      const name = this.datasetName
      const key = String.random(12)
      this.datasets.unshift({ name, key })
      this.datasets = await this.callIPC(this.task_SaveDatasets())
      this.datasetName = ''
    },
    async selectDataset(index) {
      const dataset = this.datasets.splice(index, 1)?.[0]
      //? move it to the top to indicate it is recently opened
      this.datasets.unshift(dataset)
      this.datasets = await this.callIPC(this.task_SaveDatasets())
      // TODO: launch dataset editor
    }
  }
})

window.onresize = top.app.recalculateHeight