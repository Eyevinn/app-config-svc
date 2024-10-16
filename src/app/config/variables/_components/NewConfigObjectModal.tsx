import { ConfigObject } from '@/api_config';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@nextui-org/react';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

export interface NewConfigObjectModalProps {
  onSave: (obj: ConfigObject) => void;
}

export default function NewConfigObjectModal({
  onSave
}: NewConfigObjectModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [keyId, setKeyId] = useState('');
  const [value, setValue] = useState('');

  return (
    <>
      <Button color="primary" onPress={onOpen} endContent={<IconPlus />}>
        Add New
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-row gap-1">
                Add new configuration variable
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col text-xs gap-3">
                  <Input
                    label="Key"
                    placeholder="Enter variable name"
                    onValueChange={setKeyId}
                  />
                  <Input
                    label="Value"
                    placeholder="Enter variable value"
                    onValueChange={setValue}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onSave({ key: keyId, value });
                    onClose();
                  }}
                >
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
