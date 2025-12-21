type ConfirmModalProps = {
  heading: string;
  paragraph: string;
  modalId: string;
  onConfirm: () => void;
};

export const ConfirmModal = ({
  heading,
  paragraph,
  modalId,
  onConfirm,
}: ConfirmModalProps) => {
  return (
    <s-modal id={modalId} heading={heading}>
      <s-paragraph>{paragraph}</s-paragraph>
      <s-button slot="secondary-actions" commandFor={modalId} command="--hide">
        Cancel
      </s-button>
      <s-button
        slot="primary-action"
        commandFor={modalId}
        variant="primary"
        command="--hide"
        onClick={onConfirm}
      >
        Confirm
      </s-button>
    </s-modal>
  );
};
