import { createRouter, createWebHistory } from "vue-router";

import Register from "./pages/Register.vue";
import Login from "./pages/Login.vue";
import HomePage from "./pages/HomePage.vue";
import Diary from "./pages/Diary.vue";
import DayAdd from "./pages/DayAdd.vue";
import DayIn from "./pages/DayIn.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage
  },
  {
    path: "/show/",
    name: "show"
  },
  {
    path: "/register",
    name: "register",
    component: Register
  },
  {
    path: "/login",
    name: "login",
    component: Login
  },
  {
    path: "/diary",
    name: "diary",
    component: Diary
  },
  {
    path: "/day-detail/:tripId",
    name: "day-detail",
    component: DayAdd
  },
  {
    path: "/day-detail/:tripId/:dayId",
    name: "day-insight",
    component: DayIn,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export { router };
