/*
* @Author: Just be free
* @Date:   2020-10-21 15:19:17
* @Last Modified by:   Just be free
* @Last Modified time: 2021-06-07 16:30:04
* @E-mail: justbefree@126.com
*/
import Queen, { mixins, prop, Options } from "../component/Queen";
import { h, VNode, Transition, withDirectives, vShow } from "vue";
import QFlex from "../flex";
import QFlexItem from "../flex-item";
import { getScrollTop } from "../utils/dom";
import { on, off } from "../utils/event";

class Props {
  showHeader = prop<boolean>({ default: false })
  headerHeight = prop<string|number>({ default: 44 })
  footerHeight = prop<string|number>({ default: 50 })
  showFooter = prop<boolean>({ default: true })
  monitor = prop<boolean>({ default: false }) // 是否监听scroll事件，默认为false监听
  footerTransitionName = prop<string>({ default: "slide-fade" })
  headerTransitionName = prop<string>({ default: "slide-fade-top" })
  topDistance = prop<number|string>({ default: 0 })
  bottomDistance = prop<number|string>({ default: 0 })
}
@Options({
  name: "QLayout",
  emits: ["reachtop", "reachbottom", "scroll"]
})
export default class QLayout extends mixins(Queen).with(Props) {
  public static componentName = "QLayout";
  public scrollTop = 0;
  public clientHeight = 0;
  public topTriggered = false;
  public bottomTriggered = false;
  handleBodyScroll(e: Event): void {
    const target = e.target as HTMLElement;
    const scrollTop = getScrollTop(target);
    const clientHeight = target.clientHeight;
    const diff =
      scrollTop + clientHeight - (this.scrollTop + this.clientHeight);
    const bottom =
      target.scrollHeight -
      target.offsetHeight -
      (Number(this.bottomDistance) || 0);
    const top = Number(this.topDistance) || 0;
    // diff>0 往下滑动；diff<0往上滑动
    this.$emit("scroll", { e, scrollTop, diff, bottom: bottom - scrollTop });
    if (diff < 0 && !this.topTriggered && scrollTop <= top) {
      this.topTriggered = true;
      // 到达顶部
      this.$emit("reachtop", { e, scrollTop });
    } else if (diff > 0 && scrollTop > top) {
      this.topTriggered = false;
    }
    if (diff > 0 && !this.bottomTriggered && scrollTop >= bottom) {
      this.bottomTriggered = true;
      this.$emit("reachbottom", { e, scrollTop });
      // 到达底部
    } else if (diff < 0 && scrollTop >= bottom) {
      this.bottomTriggered = false;
    } else if (diff > 0 && scrollTop < bottom) {
      this.bottomTriggered = false;
    }
    this.scrollTop = scrollTop;
    this.clientHeight = clientHeight;
  }
  getTop(pos: number = 0): void {
    const ele = (this.$refs.scrollElement as QFlexItem).$el;
    if (!ele) {
      return;
    }
    ele.scrollTop = pos;
  }
  mounted() {
    if (this.monitor) {
      const ele = (this.$refs.scrollElement as QFlexItem).$el;
      if (!ele) {
        return;
      }
      on(ele as HTMLElement, "scroll", this.handleBodyScroll);
    }
  }
  beforeUnmount() {
    if (this.monitor) {
      const ele = (this.$refs.scrollElement as QFlexItem).$el;
      if (!ele) {
        return;
      }
      off(ele, "scroll", this.handleBodyScroll);
    }
  }
  render() {
    const headerHeight = `${this.headerHeight}px`;
    const footerHeight = `${this.footerHeight}px`;
    return h("div", { class: ["q-layout"] }, {
      default: () => [
        h(QFlex,
          {
            class: ["q-layout-flex-container"],
            flexDirection: "column",
            justifyContent: "spaceBetween"
          },
          {
            default: () => [
              h(Transition, { name: this.headerTransitionName }, {
                default: () => [
                  withDirectives(h(QFlexItem, { class: ["q-layout-header"], style: { height: headerHeight } }, {
                    default: () => this.getSlots("header")
                  }), [[vShow, this.showHeader]])
                ]
              }),
              h(QFlexItem,
                {
                  class: ["q-layout-body", "q-layout-body-scroll-ele"],
                  flex: 1,
                  ref: "scrollElement"
                },
                {
                  default: () => this.getSlots("body")
                }
              ),
              h(Transition, { name: this.footerTransitionName }, {
                default: () => [
                  withDirectives(h(QFlexItem, { class: ["q-layout-footer"], style: { height: footerHeight } }, {
                    default: () => this.getSlots("footer")
                  }), [[vShow, this.showFooter]])
                ]
              })
            ]
          }
        )
      ]
    });
  }
}