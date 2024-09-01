<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { Navigation, Autoplay, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { storejs } from "../store";

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      slides: [...storejs.adv_img, ...storejs.adv_img],
      swiperOptions: {
        modules: [Navigation, Mousewheel],
        slidesPerView: 4,
        spaceBetween: 10,
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        pagination: {
          clickable: true,
        },
        mousewheel: true,
        breakpoints: {
          0: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
          1440: {
            slidesPerView: 4,
          },
        },
      },
    };
  },
  methods: {
    getImagePath(image) {
      // Usa import.meta.url per ottenere l'URL base e crea l'URL completo per l'immagine
      return new URL(`../assets/img/${image}`, import.meta.url).href;
    },
  },
  created() {
    console.log(this.slides);
  },
};
</script>

<template>
  <h2 style="font-weight: 600;"> Parti per una nuova avventura..  </h2>
  <p style="font-weight: 300;"> Rendi indimenticabile ogni viaggio che affronti salvando ogni istante!</p>
  <div class="carousel-wrap gap-2">
    
    <Swiper v-bind="swiperOptions">
      <SwiperSlide v-for="(slide, index) in slides" :key="index">
        <img :src="getImagePath(slide.link)" alt="" />
      </SwiperSlide>
      <div class="swiper-button-prev" style="color: #e640ce;"></div>
      <div class="swiper-button-next" style="color: #e640ce;"></div>
      <div class="swiper-pagination"></div>
    </Swiper>
  </div>
</template>

<style lang="scss">
.carousel-wrap {
  z-index: 0;
  padding: 10px;
  width: 80%;
}
</style>