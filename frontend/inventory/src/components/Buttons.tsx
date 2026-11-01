import { Button, ButtonGroup } from "@chakra-ui/react"



export const SaveCancel = ({ onSave, onCancel, saveLabel = "Save", cancelLabel = "Cancel" }) => (
  <ButtonGroup size="sm" variant="outline">
    <Button colorPalette="blue" onClick={onSave}>
      {saveLabel}
    </Button>
    {onCancel && (
      <Button onClick={onCancel}>
        {cancelLabel}
      </Button>
    )}
  </ButtonGroup>
)   