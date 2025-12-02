import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs'

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Prayer</Label>
        <Icon
          sf={{ default: 'clock', selected: 'clock.fill' }}
          drawable="ic_prayer"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="qibla">
        <Label>Qibla</Label>
        <Icon
          sf={{ default: 'location.north', selected: 'location.north.fill' }}
          drawable="ic_qibla"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="mushaf">
        <Label>Quran</Label>
        <Icon
          sf={{ default: 'book', selected: 'book.fill' }}
          drawable="ic_mushaf"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tracking">
        <Label>Qiyam</Label>
        <Icon
          sf={{ default: 'moon.stars', selected: 'moon.stars.fill' }}
          drawable="ic_tracking"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="radio">
        <Label>Radio</Label>
        <Icon
          sf={{ default: 'radio', selected: 'radio.fill' }}
          drawable="ic_radio"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
