import React from 'react';
import Transition, { ENTERED, ENTERING, EXITING, EXITED } from 'react-transition-group/Transition'
import { Component, PropTypes } from '../utils/';
import "./style/index.less";

/**
 * 老的文档
 * https://facebook.github.io/react/docs/animation.html
 * 新的文档
 * https://reactcommunity.org/react-transition-group/
 * 动画效果
 * https://daneden.github.io/animate.css/
 */
export default class Animate extends Component {
  constructor(...args) {
    super(...args);
    this.state = { in: false, unmountOnExit: false }
  }
  componentDidMount() {
    if (this.props.animateOnMount || this.props.in === true) {
      this.setState({ in: true })
    }
  }

  componentWillUnmount() {
    if (this.props.animateOnMount) {
      this.setState({ in: false })
    }
  }
  componentWillReceiveProps(nextProps, nextState) {
    /* istanbul ignore next */
    if (nextProps.in === undefined) return
    this.setState({
      in: nextProps.in
    })
    if (this.props.unmountOnExit !== nextProps.unmountOnExit) {
      this.setState({
        unmountOnExit: nextProps.unmountOnExit
      })
    }
  }
  render() {
    // // 动画结束删除根节点
    // if (!this.props.visible) {
    //   return false;
    // }
    const { prefixCls, sequence, className, wait, children, duration, unmountOnExit,
      onTransitionendEnter,
      onTransitionendExit,
      ...other } = this.props;
    const transitionIn = this.state.in

    const timeout = {
      enter: wait,
      exit: wait
    }
    // 样式动画
    const sequenceClassNames = sequence ? sequence.split(' ').map(s => `is-${s}`).join(' ') : null;
    const animationStyles = {
      [ENTERING]: 'is-mounting',
      [ENTERED]: 'is-mounted',
      [EXITING]: 'is-unmounting',
      [EXITED]: 'is-unmounted'
    }
    const childStyle = (child) => {
      return Object.assign({}, child && child.props ? child.props.style : {}, {
        transitionDuration: `${duration}ms`
      })
    }
    const childClassName = (child, transitionStatus) => {
      const clss = this.classNames(
        prefixCls, {
          [`${className}`]: className
        },
        sequenceClassNames,
        transitionStatus && animationStyles[transitionStatus],
        child && child.props && child.props.className
      )
      return clss;
    }
    return (
      <Transition
        ref="tran"
        {...other}
        unmountOnExit={this.state.unmountOnExit}
        addEndListener={(node, done) => {
          // 使用css transitionend事件来标记动画转换的完成
          node.addEventListener('transitionend', (a, b) => {
            this.setState({ unmountOnExit: this.props.in ? false : true }, () => {
              this.props.in ?
                onTransitionendEnter(this.props) :
                onTransitionendEnter(this.props);
            })
          }, false);
        }}
        className={prefixCls}
        in={transitionIn}
        timeout={timeout}
      >
        {status => React.cloneElement(children, {
          className: childClassName(children, status),
          style: childStyle(children)
        })}
      </Transition>
    )
  }
}

Animate.propTypes = {
  animateOnMount: PropTypes.bool,
  onTransitionendEnter: PropTypes.func,
  onTransitionendExit: PropTypes.func,
  unmountOnExit: PropTypes.bool,
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  duration: PropTypes.number,
  in: PropTypes.bool,
  sequence: PropTypes.string,
  wait: PropTypes.number
};
Animate.defaultProps = {
  onTransitionendEnter: (e) => e, //
  onTransitionendExit: (e) => e,
  prefixCls: "w-animate",
  unmountOnExit: true,  // 设置 true 销毁根节点
  animateOnMount: true, // 安装动画
  duration: 200,        // 持续时间
  wait: 0
};