import FormLayout from "@/components/auth/form-layout";
import ContactForm from "@/components/forms/contact-form";

export default function ContactPage() {
    return (
        <FormLayout
            title="Contact"
            description="Please fill out the form below to contact us."
            link={{prefix: "Return to", text: "Login", href: "/login"}}
        >
            <ContactForm />
        </FormLayout>
    )
}
