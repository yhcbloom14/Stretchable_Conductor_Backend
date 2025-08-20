import FormLayout from "@/components/auth/form-layout"
import ChangeForm from "@/components/forms/change-form"

export default async function ChangePasswordPage() {

    return (
        <FormLayout
            title="Set Password"
            description="Please enter your new password below."
        >
            <ChangeForm />
        </FormLayout>
    )
}
