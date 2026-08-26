import { Injectable, signal } from "@angular/core";

export interface ITemplateConfig
{
    layout: {
        variant: string;
        menuPosition: string;
        customizer: {
            hidden: boolean;
        };
        navbar: {
          type: string;
        }
        sidebar: {
            collapsed: boolean;
            size: string;
            backgroundColor: string;
            backgroundImage: boolean;
            backgroundImageURL: string;
        }
    };
}


@Injectable({
  providedIn: "root"
})
export class ConfigService {
  readonly templateConf = signal<ITemplateConfig>(this.createDefaultConfig());

  private createDefaultConfig(): ITemplateConfig {
    return {
      layout: {
        variant: "Light",
        menuPosition: "Side",
        customizer: {
          hidden: true
        },
        navbar: {
          type: 'Fixed'
        },
        sidebar: {
          collapsed: true,
          size: "sidebar-md",
          backgroundColor: "white",
          backgroundImage: false,
          backgroundImageURL: "assets/img/sidebar-bg/01.jpg"
        }
      }
    };
  }

  applyTemplateConfigChange(tempConfig: ITemplateConfig) {
    this.templateConf.update(current => ({
      ...current,
      ...tempConfig,
      layout: {
        ...current.layout,
        ...tempConfig.layout,
        customizer: {
          ...current.layout.customizer,
          ...tempConfig.layout?.customizer
        },
        navbar: {
          ...current.layout.navbar,
          ...tempConfig.layout?.navbar
        },
        sidebar: {
          ...current.layout.sidebar,
          ...tempConfig.layout?.sidebar
        }
      }
    }));
  }

}
