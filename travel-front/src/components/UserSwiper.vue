<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { Navigation, Autoplay, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  props: {
    photos : {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      swiperOptions: {
        modules: [Navigation, Autoplay, Mousewheel],
        slidesPerView: 1,
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
      },
    };
  },
  methods: {
    getImagePath(image) {
        const baseUrl = "http://localhost:5001";
        return `${baseUrl}${image}`;
    },
  },
  created() {
    console.log(this.photos);
  },
};
</script>

<template>
  <div class="carousel-wrap gap-2">
    
    <Swiper v-bind="swiperOptions">
      <SwiperSlide v-for="(photo, index) in photos " :key="index" class="d-flex justify-content-center">
        <img :src="getImagePath(photo)" alt="" style="max-width: 200px; aspect-ratio: 0.5/1;"/>
      </SwiperSlide>
      <div class="swiper-button-prev" style="color: #e640ce;"></div>
      <div class="swiper-button-next" style="color: #e640ce;"></div>
      <div class="swiper-pagination"></div>
    </Swiper>
  </div>
</template>

<style lang="scss">
.carousel-wrap {
  position: relative;
  z-index: 0;
  padding: 10px;
  width: 100%;
  display: flex;
}
</style>