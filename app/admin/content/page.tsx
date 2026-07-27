import { getBanners } from "./actions";
import { BannerManager } from "./BannerManager";

export default async function AdminContentPage() {
  const banners = await getBanners();

  return <BannerManager banners={banners} />;
}
