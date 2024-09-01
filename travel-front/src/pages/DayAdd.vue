<script>
import tt from "@tomtom-international/web-sdk-services";
export default {
  data() {
    return {
      tripId: null,
      tripDetails: {},
      newDay: {
        description: "",
        date: "",
        location: "",
        latitude: null,
        longitude: null,
        photo: [],
      },
      isAdding: false,
      suggestions: [],
      isLoading: true,
    };
  },
  created() {
    this.tripId = this.$route.params.tripId;
    this.fetchTripDetails();
  },
  methods: {
    async fetchTripDetails() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5001/trips/${this.tripId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Errore nella richiesta: " + response.statusText);
        }
        const data = await response.json();
        this.tripDetails = data.trip;
        if (!this.tripDetails.days) {
          this.tripDetails.days = [];
        }
      } catch (error) {
        console.error("Errore nel recuperare i dettagli del viaggio:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async addDay() {
      try {
        const token = localStorage.getItem("token");

        const dayData = {
          description: this.newDay.description,
          date: this.newDay.date,
          location: this.newDay.location,
          latitude: this.newDay.latitude,
          longitude: this.newDay.longitude,
          tripId: this.tripId,
          photoUrl: this.newDay.photo.length > 0 ? this.newDay.photo : null,
        };

        const response = await fetch("http://localhost:5001/days", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dayData),
        });

        if (!response.ok) {
          throw new Error(
            "Errore nell'aggiunta del giorno: " + response.statusText
          );
        }

        const data = await response.json();

        if (!this.tripDetails.days) {
          this.tripDetails.days = [];
        }

        this.tripDetails.days.push(data.day);
        // Reset
        this.resetNewDay();
        window.location.reload();
      } catch (error) {
        console.error("Errore nell'aggiunta del giorno:", error);
      }
    },
    handleFileUpload(event) {
      console.log("Event: ", event);
      const files = event.target.files;
      console.log("Files: ", files);

      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          console.log("File type: ", file instanceof Blob);
          if (file instanceof Blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              this.newDay.photo.push(reader.result);
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
    resetNewDay() {
      this.newDay = {
        description: "",
        date: null,
        location: "",
        latitude: null,
        longitude: null,
        photo: [],
      };
    },
    formControl() {
      this.isAdding = !this.isAdding;
    },
    performSearch() {
      if (this.newDay.location.length > 2) {
        tt.services
          .fuzzySearch({
            key: "ZcdgGKenw2zWR1ufYKujLP0vgRMnGtMM", // Inserisci qui la tua chiave API
            query: this.newDay.location,
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
      this.newDay.latitude = suggestion.position.lat;
      this.newDay.longitude = suggestion.position.lng;
      this.newDay.location = suggestion.address.freeformAddress;
      this.suggestions = [];
    },
    formatDate(date) {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const formattedDate = new Date(date).toLocaleDateString("it-IT", options);
      return formattedDate;
    },
    async deleteDay(dayId) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5001/days/${dayId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            "Errore nell'eliminazione del giorno: " + response.statusText
          );
        }
        // Rimuovo in loco
        this.tripDetails.days = this.tripDetails.days.filter(
          (day) => day.id !== dayId
        );
        window.location.reload();
      } catch (error) {
        console.error("Errore nell'eliminazione del giorno:", error);
      }
    },
    async deleteTrip() {
      if (confirm("Sei sicuro di voler eliminare questo viaggio?")) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `http://localhost:5001/trips/${this.tripId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              "Errore nell'eliminazione del viaggio: " + response.statusText
            );
          }

          // alert("Viaggio eliminato!");
          this.$router.push("/diary"); 
        } catch (error) {
          console.error("Errore nell'eliminazione del viaggio:", error);
        }
      }
    },
  },
  computed: {
    sortedDays() {
      if (this.tripDetails.Days) {
        // Ordina i giorni per data
        return this.tripDetails.Days.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      return [];
    }
  }
};
</script>

<template>
  <div class="trip-detail">
    <div v-if="isLoading" class="spinner-border text-light" role="status">
      <span class="visually-hidden">Caricamento in corso...</span>
    </div>
    <div v-else>
      <div class="text-center trip-detail-header">
        <h3>'{{ tripDetails.name }}'</h3>
        <p>{{ tripDetails.startDate }} - {{ tripDetails.endDate }}</p>
      </div>
      <!-- Giorni aggiunti -->
      <div
        class="trips-card"
        v-if="sortedDays && sortedDays.length > 0"
      >
        <h5 class="text-center">Ecco i ricordi delle tue giornate :</h5>
        <div v-for="day in sortedDays" :key="day.id">
          <div class="p-2">
            <p>
              {{ formatDate(day.date) }} <br> @<i>{{ day.location }}</i
              >&#128205;
            </p>
            <router-link
              :to="{
                name: 'day-insight',
                params: { tripId: this.tripId, dayId: day.id },
              }"
              ><span class="btn btn-light">Dettagli viaggio</span></router-link
            >
            <span class="btn btn-dark mx-2" @click="deleteDay(day.id)"
              >&#128465;</span
            >
          </div>
        </div>
      </div>
      <!-- Giorni da aggiungere -->
      <div v-else>
        <p class="text-center">Ooops com'è vuoto &#128542;</p>
      </div>
    </div>

    <section class="text-center mt-4">
      <span class="btn btn-danger my-3" @click="deleteTrip">Elimina Viaggio</span>
      <h5>Aggiungi una giornata di viaggio &#128747;</h5>
      <a
        href="#"
        class="btn btn-dark rounded-circle mt-2 mb-3"
        @click="formControl()"
        ><span class="fs-6 d-block"> + </span></a
      >
    </section>

    <!-- Form di aggiunta del giorno -->
    <form
      class="trip-detail-form"
      @submit.prevent="addDay"
      :class="isAdding ? 'd-block' : 'd-none'"
    >
      <textarea
        v-model="newDay.description"
        class="form-item"
        placeholder="Descrizione"
        required
      ></textarea>
      <input
        v-model="newDay.date"
        type="date"
        :min="tripDetails.startDate"
        :max="tripDetails.endDate"
        class="form-item"
        placeholder="Data del giorno"
        required
      />
      <input
        v-model="newDay.location"
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
      <input
        type="file"
        class="form-item"
        @change="handleFileUpload"
        accept="image/*"
        multiple
      />
      <div class="d-flex justify-content-center">
        <button type="submit">Salva &#128204;</button>
      </div>
    </form>
    <!-- / Form -->
    <div class="ms_circle position-absolute">
      <router-link to="/diary"
        ><span class="ms_backbtn">&LeftArrow;</span></router-link
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.day-detail {
  padding: 20px;
}

.day-detail h1 {
  margin-bottom: 20px;
}

.day-detail div {
  margin-bottom: 20px;
}

form {
  margin-top: 16px;
}

form input,
form textarea {
  display: block;
  width: 100%;
  margin-bottom: 10px;
}

form button {
  margin-top: 10px;
}

.ms_circle {
  background-color: #212429;
  border-radius: 50%;
  width: 36.94px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  transform: translate(-10px, -10px);
}

.ms_backbtn {
  color: white;
}

@media (max-width: 425px) {
  .ms_circle {
    margin-bottom: 24px;
    width: 34px;
    height: 34px;
    transform: translate(10px, 10px);
  }
}

@media (min-width: 426px) {
  .ms_circle {
    margin-bottom: 24px;
  }
}
</style>
