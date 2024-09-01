<script>
import VueCal from "vue-cal";
import UserMap from '../components/UserMap.vue';
import "vue-cal/dist/vuecal.css";

export default {
  components: { VueCal, UserMap },
  data() {
    return {
      username: "",
      isAdding: false,
      isMap : false,
      diary: [],
      diaryId: null,
      tripName: "",
      tripLength: null,
      dateRange: {
        start: "",
        end: "",
      },
    };
  },
  created() {
    this.username = localStorage.getItem("username");
    console.log(this.username);
    console.log("Caricamento Diario Utente");
    this.fetchDiary();
    console.log(localStorage.getItem("token"));
  },
  methods: {
    async fetchDiary() {
      try {
        // Recupero il token che butto nell'header per essere autorizzato
        const token = localStorage.getItem("token");
        // Aspetto la risposta dal server su Eventuali Diari dell'utente
        const response = await fetch("http://localhost:5001/diary", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(
            "Errore nella richiesta : " + response.statusText + response.status
          );
        }
        const data = await response.json();
        console.log("Data ricevuti", data);
        if (data.diaries && data.diaries.length > 0) {
          this.diary = data.diaries[0]; // Assicurati che diary contenga dati validi
          this.diaryId = this.diary.id;
          console.log(this.diary.Trips);
        } else {
          this.diary = {}; // Gestisci il caso in cui non ci sono diari
        }
      } catch (error) {
        console.log(error);
      }
    },
    formControl() {
      this.isAdding = !this.isAdding;
    },
    async addTrip() {
      try {
        console.log(
          this.tripName,
          this.dateRange.start,
          this.dateRange.end,
          this.diaryId
        );
        const response = await fetch("http://localhost:5001/trips", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT
          },
          body: JSON.stringify({
            name: this.tripName,
            startDate: this.dateRange.start,
            endDate: this.dateRange.end,
            diaryId: this.diaryId,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Viaggio aggiunto con successo:", data);
          // Potresti voler aggiornare la lista dei viaggi qui
          await this.fetchDiary();
          this.isAdding = false;
          this.tripName = "";
          this.dateRange = { start: "", end: "" };
        } else {
          console.error("Errore aggiunta viaggio:", data);
        }
      } catch (error) {
        console.error("Errore nella richiesta:", error);
      }
    },
    logout() {
      localStorage.clear();
      this.$router.push("/login");
    },
    openMap(){
      console.log('Mappa Aperta');
      this.isMap = !this.isMap;
    }
  },
};
</script>
<template>
  <div class="main-diary mt-5 container">
    <h2 class="text-center mb-3">
      Bentornato  <i>{{ username }}</i> &#128513;
    </h2>

    <!-- Caso Utente con Viaggi -->
    <div v-if="diary.Trips.length > 0">
      <h6 class="text-center">Ecco un resoconto delle tue avventure finora &#128640;</h6>
      <div class="d-flex justify-content-center my-4">
        <a class="text-center btn btn-light" @click="openMap()">Mappa delle tue avventure &#127757;</a>
      </div>
      <!-- Trips è un array, itero sull'array con i viaggi -->
      <section class="trip-card">
        <ul v-for="trip in diary.Trips">
          <li>
            <section class="d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between">
                <h4>
                  <b>"{{ trip.name }}"</b>
                </h4>
                <router-link
                  :to="{ name: 'day-detail', params: { tripId: trip.id } }"
                >
                  <a href="#" class="btn btn-dark" style="margin-left: 10px;">
                    <span class="d-block"> &#128395</span> 
                  </a>
                </router-link>
              </div>

              <small>{{ trip.startDate }} ~ {{ trip.endDate }}</small>
            </section>
          </li>
        </ul>
      </section>

      <div class="my-3 text-center">
        <h4>Aggiungi un nuovo viaggio &#128747;</h4>
        <a
          href="#"
          class="btn btn-dark rounded-circle mb-3"
          @click="formControl()"
          ><span class="fs-6">+</span></a
        >
        <!-- Form di aggiunta Viaggio -->
        <div class="trip-card" :class="isAdding ? 'd-block' : 'd-none'">
          <div class="trip-card-header">
            <h4>Compila questo form</h4>
          </div>
          <form class="trip-card-form" @submit.prevent="addTrip">
            <div class="form-control">
              <input
                type="text"
                placeholder="Nome Viaggio"
                id="tripNameForm"
                v-model="tripName"
                autofocus
                required
              />
            </div>
            <!-- Calendario -->
            <div class="form-group">
              <label class="my-1" for="startDate">Inizio Viaggio :</label>
              <div class="form-item">
                <input
                  type="date"
                  id="startDate"
                  class="form-control"
                  v-model="dateRange.start"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="my-1" for="endDate">Rientro Viaggio : </label>
              <input
                type="date"
                id="endDate"
                class="form-control"
                v-model="dateRange.end"
              />
            </div>
            <!-- / Calendario -->
            <button type="submit">Aggiungi Viaggio &#128640;</button>
          </form>
        </div>
        <!-- / Form -->
      </div>
    </div>
    <!-- / Caso Utente con Viaggi -->
    <!-- Caso Utente senza Viaggi -->
    <div class="mb-2" v-else>
      <div class="mb-2 text-center">
        <h4>
          Ooops com'è vuoto &#129320; inserisci una nuova <i>avventura</i>
        </h4>
        <a href="#" class="btn btn-dark rounded-circle" @click="formControl()"
          ><span class="fs-6">+</span></a
        >
      </div>
      <!-- Form di aggiunta Viaggio -->
      <div class="trip-card" :class="isAdding ? 'd-block' : 'd-none'">
        <div class="trip-card-header">
          <h4>Compila questo form</h4>
        </div>
        <form class="trip-card-form" @submit.prevent="addTrip">
          <div class="form-control">
            <input
              type="text"
              placeholder="Nome Viaggio"
              id="tripNameForm"
              v-model="tripName"
              autofocus
              required
            />
          </div>
          <!-- Calendario -->
          <div class="form-group">
            <label class="my-1" for="startDate">Inizio Viaggio :</label>
            <div class="form-item">
              <input
                type="date"
                id="startDate"
                class="form-control"
                v-model="dateRange.start"
              />
            </div>
          </div>
          <div class="form-group">
            <label class="my-1" for="endDate">Rientro Viaggio : </label>
            <input
              type="date"
              id="endDate"
              class="form-control"
              v-model="dateRange.end"
            />
          </div>
          <!-- / Calendario -->
          <button type="submit">Aggiungi Viaggio &#128640;</button>
        </form>
      </div>
      <!-- / Form -->
    </div>
    <div :class="isMap ? 'd-block' : 'd-none'" class="d-flex justify-content-center mb-4">
      <UserMap :diary="diary"/>
    </div>
    <div class="d-flex justify-content-center">
      <a class="text-center btn btn-danger" @click="logout()">Logout</a>
    </div>

    
  </div>
</template>
<style lang="scss">
@use "../sass/partials/logreg" as *;
</style>
