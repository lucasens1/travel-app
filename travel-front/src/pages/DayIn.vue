<template>
  <div class="trip-detail position-relative">
    <div v-if="dayDetails">
      <h3>{{ dayDetails.description }}</h3>
      <small>{{ formatDate(dayDetails.date) }}</small>
      <h5>@{{ dayDetails.location }} &#128205;</h5>
      <!-- Carosello -->
      <div
        v-if="
          dayDetails.photoUrl &&
          Array.isArray(dayDetails.photoUrl) &&
          dayDetails.photoUrl.length
        "
      >
        <UserSwiper ref="userSwiper" :photos="dayDetails.photoUrl" />
      </div>
      <!-- /Carosello -->
      <p v-else>Nessuna foto disponibile.. aggiungine qualcuna &#128248;</p>
    </div>

    <div v-else>
      <p>Caricamento in corso...</p>
    </div>
    <!-- Torna indietro -->
    <div>
      <router-link :to="{ name: 'day-detail', params: { tripId: tripId } }"
        ><span class="ms_circle ms_backbtn">&LeftArrow;</span></router-link
      >
    </div>
    <!-- / Indietro -->
    <!-- Tasto modifica -->
    <div class="d-flex justify-content-center my-3">
      <a href="#" class="btn btn-light" @click="formControl()">Modifica</a>
    </div>
    <div :class="isMod ? 'd-block' : 'd-none'">
      <form @submit.prevent="submitChanges">
        <div class="mb-3">
          <label for="description" class="form-label">Descrizione : </label>
          <textarea
            type="text"
            id="description"
            v-model="dayMod.description"
            class="form-control"
          >
          </textarea>
        </div>
        <div class="mb-3">
          <label for="date" class="form-label">Data :</label>
          <input
            type="date"
            id="date"
            v-model="dayMod.date"
            class="form-control"
          />
        </div>
        <div class="mb-3">
          <label for="location" class="form-label">Luogo :</label>
          <input
            v-model="dayMod.location"
            type="text"
            class="form-item"
            placeholder="Località"
            @input="performSearch"
          />
          <ul
            v-if="suggestions.length"
            style="background-color: white; height: 10vh; overflow: scroll"
          >
            <li
              v-for="suggestion in suggestions"
              :key="suggestion.id"
              @click="selectSuggestion(suggestion)"
            >
              {{ suggestion.address.freeformAddress }}
            </li>
          </ul>
        </div>
        <div class="my-3 p-2">
          <u><strong>Modifica foto work in progress.. update in arrivo</strong></u> &#128308;
        </div>
        <button type="submit" class="btn btn-primary">Conferma Modifica</button>
      </form>
    </div>
  </div>
</template>

<script>
import tt from "@tomtom-international/web-sdk-services";
import UserSwiper from "../components/UserSwiper.vue";
export default {
  components: { UserSwiper },
  props: ["tripId", "dayId"],
  data() {
    return {
      isMod: false,
      dayDetails: null,
      suggestions: [],
      baseUrl: "http://localhost:5001",
      dayMod: {
        description: "",
        date: "",
        location: "",
        latitude: null,
        longitude: null,
        photo: [],
      },
    };
  },
  async created() {
    await this.fetchDayDetails();
  },
  methods: {
    async fetchDayDetails() {
      try {
        const response = await fetch(
          `http://localhost:5001/day-detail/${this.tripId}/${this.dayId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Errore nella richiesta: " + response.statusText);
        }
        const data = await response.json();
        console.log(data.day)
        this.dayDetails = data.day;
        console.log("Dettagli della giornata : ", this.dayDetails);
        // Popolo dayMod con i dati del dettaglio della giornata
        this.dayMod.description = this.dayDetails.description || "";
        this.dayMod.date = this.dayDetails.date || "";
        this.dayMod.location = this.dayDetails.location || "";
        this.dayMod.latitude = this.dayDetails.latitude || null;
        this.dayMod.longitude = this.dayDetails.longitude || null;
        this.dayMod.photo = this.dayDetails.photoUrl || [];
        console.log("Dettagli della giornata nella modifica :", this.dayMod);
      } catch (error) {
        console.error("Errore nel recuperare i dettagli del giorno:", error);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    getImagePath(photo) {
      return `${this.baseUrl}${photo}`;
    },
    formControl() {
      this.isMod = !this.isMod;
    },
    async submitChanges() {
      try {
        const token = localStorage.getItem("token");
        console.log("Photo URLs:", this.dayMod.photo);
        const dayData = {
          description: this.dayMod.description,
          date: this.dayMod.date,
          location: this.dayMod.location,
          latitude: this.dayMod.latitude,
          longitude: this.dayMod.longitude,
          tripId: this.tripId,
          photoUrl: this.dayMod.photo.length > 0 ? this.dayMod.photo : [],
        };
        const response = await fetch(
          `http://localhost:5001/days/${this.dayId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(dayData),
          }
        );
        if (!response.ok) {
          throw new Error(
            "Errore nella richiesta di modifica: " + response.statusText
          );
        }
        const updatedDay = await response.json();
        console.log("Updated day response:", updatedDay);
        this.dayDetails = updatedDay.day; // Aggiorna i dettagli con quelli modificati
        console.log('Dettagli aggiornati ? : ', this.dayDetails);
        this.isMod = false; // Chiudi il form di modifica
        // Chiama fetchDayDetails per ottenere i dettagli aggiornati
        await this.fetchDayDetails();
        // window.location.reload();
      } catch (error) {
        console.error("Errore nell'inviare le modifiche:", error);
      }
    },
    performSearch() {
      if (this.dayMod.location.length > 2) {
        tt.services
          .fuzzySearch({
            key: "ZcdgGKenw2zWR1ufYKujLP0vgRMnGtMM",
            query: this.dayMod.location,
          })
          .then((response) => {
            this.suggestions = response.results.slice(0, 5);
          })
          .catch((error) => {
            console.error("Errore nella fuzzy search:", error);
          });
      } else {
        this.suggestions = [];
      }
    },
    selectSuggestion(suggestion) {
      this.dayMod.latitude = suggestion.position.lat;
      this.dayMod.longitude = suggestion.position.lng;
      this.dayMod.location = suggestion.address.freeformAddress;
      this.suggestions = [];
    },
    handleFileUpload(event) {
      const files = event.target.files;
      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          if (file instanceof Blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (this.isMod) {
                this.dayMod.photo.push(reader.result); // Per modifica
              } else {
                this.newDay.photo.push(reader.result); // Per creazione
              }
            };
            reader.readAsDataURL(file);
          } else {
            console.error("Il file selezionato non è valido:", file);
          }
        });
      } else {
        console.error(
          "Nessun file selezionato o accesso ai file non riuscito."
        );
      }
    },
  },
};
</script>

<style scoped>
.ms_circle {
  background-color: #212429;
  border-radius: 50%;
  width: 36.94px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  position: absolute;
  right: 0;
  margin-top: 18px;
}

.ms_backbtn {
  color: white;
}

@media (max-width: 425px) {
  .ms_circle {
    margin-right: 24px;
    width: 34px;
    height: 34px;
  }
}

@media (min-width: 426px) {
  .ms_circle {
    margin-right: 24px;
  }
}
</style>
