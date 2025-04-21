import meal from './meal'
import combo from './combo'
import order from './orders'
import settings from './settings'
import paymentSettings from './paymentSettings'
import pickupSettings from './pickupSettings'
import openingHours from './openingHours'
import category from './category'
import extra from './extra'
import adminUser from './adminUser'
import {about} from './about'
import sizeOption from './sizeOption'
import choice from './choice'

export const schemaTypes = [
  choice,
  sizeOption,
  meal,
  combo,
  order,
  category,
  extra,
  settings,
  paymentSettings,
  pickupSettings,
  openingHours,
  adminUser,
	about
]