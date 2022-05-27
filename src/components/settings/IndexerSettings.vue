<template>
  <div class="wrapper">
    <h2>Video Filetypes</h2>
    <table>
      <thead>
      <tr>
        <th>#</th>
        <th>Filetype</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(filetype, index) in videoFiletypes" v-bind:key="index">
        <td class="id">
          {{ index + 1 }}
        </td>
        <td>
          {{ filetype }}
        </td>
        <td class="actions">
          <a title="Remove filetype" v-on:click="deleteSeriesLibrary(filetype)">
            <FontAwesomeIcon :icon="deleteIcon"/>
          </a>
        </td>
      </tr>
      </tbody>
    </table>
    <a class="button" v-on:click="filetypeAdd('video')">Add Filetype</a>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import faTrash from '@fortawesome/fontawesome-free-solid/faTrash';
import oblectoClient from '@/oblectoClient';

export default {
  name: 'IndexerSettings',
  components: {
    FontAwesomeIcon,
  },
  computed: {
    deleteIcon() {
      return faTrash;
    },
  },
  data() {
    return {
      videoFiletypes: [],
    };
  },
  async created() {
    const filetypes = (await oblectoClient.axios.get('/settings/fileExtensions')).data;

    this.videoFiletypes = filetypes.video;
  },
  methods: {
    async filetypeAdd(type) {
      console.log(`Add filetype: ${type}`);
    },
  },
};
</script>

<style scoped lang="sass">

  .button
    background-color: rgba(0,0,0,0.5)
    border: rgba(0,0,0,0.8) 1px solid
    color: rgba(255,255,255,0.5)

    padding: 10px
    -webkit-border-radius: 3px
    -moz-border-radius: 3px
    border-radius: 3px
    cursor: pointer

    display: block
    width: 100%

    max-width: 200px

    margin: 5px 0

    text-align: center

  h2
    padding-left: 40px

  table
    background: #696060
    box-shadow: 0 0 5px 2px rgba(darken(#696060, 20), 0.75)

    border-spacing: 0

    width: 100%

    thead
      background-color: #444042
      box-shadow: 0 0 5px 2px rgba(darken(#696060, 20), 0.75)

      th
        padding: 10px

        margin: 0
        border: 0

        outline: 0
    tr:nth-child(even)
      background-color: darken(#696060, 2)

    td
      padding: 10px

    .id
      text-align: right

    .actions
      text-align: center

    .button
      background-color: rgba(0,0,0,0.5)
      border: rgba(0,0,0,0.8) 1px solid
      color: rgba(255,255,255,0.5)

      padding: 10px
      -webkit-border-radius: 3px
      -moz-border-radius: 3px
      border-radius: 3px
      cursor: pointer

      display: block
      width: 100%

      max-width: 200px

      margin: 5px 0

      text-align: center

</style>
