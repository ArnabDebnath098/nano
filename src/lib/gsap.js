// Central GSAP setup — import gsap, plugins and useGSAP from here.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'
import { registerNanoEases } from '../../animation-reference/noon-nano/motion.js'

gsap.registerPlugin(useGSAP, ScrollTrigger, Draggable, CustomEase)

gsap.defaults({ duration: 0.4, ease: 'power2.out' })

// noon NANO cubic-bezier curves as named eases: 'nano.iosOut', 'nano.fade', 'nano.scrimIn', …
// (spring / PP linear() curves are used as functions — see lib/motion.js)
registerNanoEases(CustomEase)

// Emil Kowalski's strong curves, as named eases ('emil.out' = --ease-out, 'emil.inOut' = --ease-in-out)
CustomEase.create('emil.out', 'M0,0 C0.23,1 0.32,1 1,1')
CustomEase.create('emil.inOut', 'M0,0 C0.77,0 0.175,1 1,1')

export { gsap, ScrollTrigger, Draggable, CustomEase, useGSAP }
