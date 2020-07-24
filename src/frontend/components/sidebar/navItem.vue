<template>
  <li class="nav--item" :class="{'is-expanded': expanded}">
    
    <router-link
      class="nav--item-label nav--item-clickable"
      v-if="isItemALink"
      :to="item.path"
    >
    {{ item.label }}
      <component v-if="item.icon" :is="item.icon" class="sidebar--item-icon" />
    </router-link>

    <button
      v-else
      @click="toggleCollapse()"
      class="nav--item-clickable"
      :class="depth === 0 ? 'nav--item-rootLabel' : 'nav--item-label'"
    >
      <icon-triangle v-if="depth === 0" />
      <span>{{item.label}}</span>
      <component v-if="item.icon" :is="item.icon" class="sidebar--item-icon" />
    </button>


    <transition name="nav--listWrapper" mode="in-out">
      <transition-group
        v-if="item.items && item.items.length && expanded"
        :class="`nav--list nav--list_${(depth + 1)}`"
        tag="ul"
        name="nav--list"
        appear
      >
        <nav-item :depth="(depth + 1)" v-for="sub in item.items" :key="sub.label" :item="sub" />
      </transition-group>
    </transition>
  </li>
</template>

<script>
import navItem from '@/components/sidebar/navItem.vue';
export default {
  name: 'navItem',
  components: {
    navItem,
  },
  props: {
    item: Object,
    depth: Number,
  },
  data() {
    return {
      expanded: this.item.expanded,
    };
  },
  methods: {
    toggleCollapse() {
      this.expanded = !this.expanded;
    },
    beforeEnter(e) {
      console.log(e);
    },
    enter(el, done) {
      console.log(el);
      done();
    },
    afterEnter(e) {
      console.log(e);
    },
    enterCancelled(e) {
      console.log(e);
    },
    beforeLeave(e) {
      console.log(e);
    },
    leave(el, done) {
      console.log(el);
      done();
    },
    afterLeave(e) {
      console.log(e);
    },
    leaveCancelled(e) {
      console.log(e);
    },
  },
  computed: {
    isItemALink() {
      return this.item.path && this.item.path.length;
    },
  },
};
</script>