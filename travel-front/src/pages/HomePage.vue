<script>
import Swiper from '../components/Swiper.vue';

export default{
  components: {
    Swiper
  }
}
</script>
 <template>
 <!-- Container della webapp -->
 <div class="container-fluid pt-5 d-flex flex-column ">
  <!-- Titolo -->
   <div class="container text-center">
    <img src="../assets/img/title.png" style="max-width: 400px;">
   </div>
   
    <!-- Container schermata d'avvio -->
    <div class="container text-center p-3 main-card">
      <!-- Container dello swiper per immagini utente -->
      <div class="container p-4">
        <Swiper />
      </div>
      
      <div class="container mt-4">
        <h6 class="p-3 mb-4"><i>Tieni anche tu un diario di viaggio e salva ogni tua <b>esperienza</b>! </i></h6>
        <router-link to="/register" ><button class="py-3">Inizia!</button></router-link>
      </div>  
    </div>
  </div></template>
 