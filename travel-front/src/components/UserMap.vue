<template>
  <div id="map" style="width: 400px; height: 300px; border-radius: 30px"></div>
</template>

<script>
import tt from "@tomtom-international/web-sdk-maps";

export default {
  props: { diary: { type: Object } },
  name: "TomTomMap",
  mounted() {
    const map = tt.map({
      key: "ZcdgGKenw2zWR1ufYKujLP0vgRMnGtMM", // Sostituisci con la tua API Key
      container: "map", // L'ID del div dove vuoi che la mappa sia visualizzata
      center: [9.19, 45.4642], // Posizione iniziale
      zoom: 0,
    });

    this.diary.Trips.forEach((trip) => {
      trip.Days.forEach((day) => {
        if (day.latitude && day.longitude) {
          const marker = new tt.Marker({
            element: this.createCustomMarkerElement(),
          })
            .setLngLat([day.longitude, day.latitude])
            .addTo(map);

          const popup = new tt.Popup({ offset: 35 }).setText(
            `${day.location || "Location"}: ${day.description || "Description"}`
          );
          marker.setPopup(popup);
        }
      });
    });
  },
  methods: {
    createCustomMarkerElement() {
      const element = document.createElement("span");
      element.className = "custom-marker";
      element.innerHTML = "&#128205;"; // Usare l'emoji come marker
      return element;
    },
  },
};
</script>

<style scoped>
/* Puoi aggiungere eventuali stili personalizzati qui */
.custom-marker {
  font-size: 60px; /* Dimensione dell'emoji */
  line-height: 1;
  text-align: center;
  transform: translate(
    -50%,
    -50%
  ); /* Per centrare l'emoji rispetto al punto di ancoraggio */
}

</style>
