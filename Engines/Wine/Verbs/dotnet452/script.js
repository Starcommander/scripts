const Wine = include("engines.wine.engine.object");
const Resource = include("utils.functions.net.resource");

const Optional = Java.type("java.util.Optional");

const OverrideDLL = include("engines.wine.plugins.override_dll");
const WindowsVersion = include("engines.wine.plugins.windows_version");
const Regedit = include("engines.wine.plugins.regedit");
const RemoveMono = include("engines.wine.verbs.remove_mono");
const DotNET40 = include("engines.wine.verbs.dotnet40");

/**
 * Verb to install .NET 4.5.2
 */
class DotNET452 {
    constructor(wine) {
        this.wine = wine;
    }

    go() {
        const wizard = this.wine.wizard();

        const windowsVersion = new WindowsVersion(this.wine).getWindowsVersion();

        print(tr("This package ({0}) does not work currently. Use it only for testing!", "dotnet452"));

        const setupFile = new Resource()
            .wizard(wizard)
            .url(
                "https://download.microsoft.com/download/E/2/1/E21644B5-2DF2-47C2-91BD-63C560427900/NDP452-KB2901907-x86-x64-AllOS-ENU.exe"
            )
            .checksum("89f86f9522dc7a8a965facce839abb790a285a63")
            .name("NDP452-KB2901907-x86-x64-AllOS-ENU.exe")
            .get();

        new RemoveMono(this.wine).go();

        new DotNET40(this.wine).go();

        new WindowsVersion(this.wine).withWindowsVersion("win7").go();

        new OverrideDLL(this.wine).withMode("builtin", ["fusion"]).go();

        wizard.wait(tr("Please wait while {0} is installed...", ".NET Framework 4.5.2"));

        this.wine.run(setupFile, [setupFile, "/q", '/c:"install.exe /q"'], null, false, true);

        wizard.wait(tr("Please wait..."));

        new Regedit(this.wine).deleteValue("HKCU\\Software\\Wine\\DllOverrides", "*fusion");

        new OverrideDLL(this.wine).withMode("native", ["mscoree"]).go();

        new WindowsVersion(this.wine).withWindowsVersion(windowsVersion).go();

        if (windowsVersion != "win2003") {
            print(tr('{0} applications can have issues when windows version is not set to "win2003"', ".NET 4.5.2"));
        }
    }

    static install(container) {
        const wine = new Wine();
        const wizard = SetupWizard(InstallationType.VERBS, "dotnet452", Optional.empty());

        wine.prefix(container);
        wine.wizard(wizard);

        wizard.message(tr("This package ({0}) does not work currently. Use it only for testing!", "dotnet452"));

        new DotNET452(wine).go();

        wizard.close();
    }
}

module.default = DotNET452;
