import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DefaultInputs from "../../components/ficha/form-elements/DefaultInputs";
import InputGroup from "../../components/ficha/form-elements/InputGroup";
import DropzoneComponent from "../../components/ficha/form-elements/DropZone";
import CheckboxComponents from "../../components/ficha/form-elements/CheckboxComponents";
import RadioButtons from "../../components/ficha/form-elements/RadioButtons";
import ToggleSwitch from "../../components/ficha/form-elements/ToggleSwitch";
import FileInputExample from "../../components/ficha/form-elements/FileInputExample";
import SelectInputs from "../../components/ficha/form-elements/SelectInputs";
import TextAreaInput from "../../components/ficha/form-elements/TextAreaInput";
import InputStates from "../../components/ficha/form-elements/InputStates";
import PageMeta from "../../components/common/PageMeta";

export default function FormElements() {
  return (
    <div>
      <PageMeta
        title="React.js Form Elements Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="From Elements" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <DefaultInputs />
          <SelectInputs />
          <TextAreaInput />
          <InputStates />
        </div>
        <div className="space-y-6">
          <InputGroup />
          <FileInputExample />
          <CheckboxComponents />
          <RadioButtons />
          <ToggleSwitch />
          <DropzoneComponent />
        </div>
      </div>
    </div>
  );
}
