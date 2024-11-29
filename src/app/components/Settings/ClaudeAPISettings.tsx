import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { ClaudeAPIModel, UserConfig } from '~services/user-config'
import { Input } from '../Input'
import Select from '../Select'
import Blockquote from './Blockquote'

interface Props {
  userConfig: UserConfig
  updateConfigValue: (update: Partial<UserConfig>) => void
}

const ClaudeAPISettings: FC<Props> = ({ userConfig, updateConfigValue }) => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2 w-[400px]">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-sm">API Key</p>
        <Input
          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          value={userConfig.claudeApiKey}
          onChange={(e) => updateConfigValue({ claudeApiKey: e.currentTarget.value })}
          type="password"
        />
        <Blockquote className="mt-1">{t('Your keys are stored locally')}</Blockquote>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium text-sm">{t('API Model')}</p>
        <Select
          options={Object.entries(ClaudeAPIModel).map(([k, v]) => ({ name: k, value: v }))}
          value={userConfig.claudeApiModel}
          onChange={(v) => updateConfigValue({ claudeApiModel: v })}
        />
      </div>
    </div>
  )
}

export default ClaudeAPISettings
