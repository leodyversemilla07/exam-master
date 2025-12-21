import AppLogoIcon from "@/components/app-logo-icon";

export default function AppLogo() {
    return (
        <>
            <div className="bg-gradient-to-br from-primary to-secondary flex aspect-square size-8 items-center justify-center rounded-md shadow-primary">
                <AppLogoIcon className="size-5 fill-current text-primary-foreground" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">
                    ExamMaster
                </span>
            </div>
        </>
    );
}
