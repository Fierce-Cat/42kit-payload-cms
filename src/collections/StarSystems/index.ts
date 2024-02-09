import { CollectionConfig } from 'payload/types'
import { slugField } from '../../fields/slug'

const StarSystems: CollectionConfig = {
  slug: 'star-systems',
  admin: {
    useAsTitle: 'name',
  },
  labels: {
    singular: {
      zh: '星系',
      en: 'Star System',
    },
    plural: {
      zh: '星系',
      en: 'Star Systems',
    },
  },
  fields: [
    {
      name: 'name', // 星系名称
      required: true,
      type: 'text', 
      localized: true,
      label: {
        zh: '名称',
        en: 'Name',
      },
    },
    { // 星系分类
      name: 'category', // 星系分类
      type: 'select',
      hasMany: false,
      admin: {
        isClearable: true,
        isSortable: true, 
      },
      options: [
        {
          value: 'banu',
          label: {
            zh: '巴努星系',
            en: 'Banu System',
          }
        },
        {
          value: 'developing',
          label: {
            zh: '开发中的星系',
            en: 'Developing System',
          }
        },
        {
          value: 'krthak',
          label: {
            zh: '克萨克星系',
            en: 'Kr\'Thak System',
          }
        },
        {
          value: 'transitional',
          label: {
            zh: '过渡星系',
            en: 'Transitional System',
          }
        },
        {
          value: 'unclaimed',
          label: {
            zh: '无人星系',
            en: 'Unclaimed System',
          }
        },
        {
          value: 'vanduul',
          label: {
            zh: '范杜尔星系',
            en: 'Vanduul System',
          }
        },
        {
          value: 'xi\'an',
          label: {
            zh: '西安星系',
            en: 'Xi\'An System',
          }
        },
        {
          value: 'uee',
          label: {
            zh: 'UEE星系',
            en: 'UEE System',
          }
        },
        {
          value: 'unknown',
          label: {
            zh: '未知星系',
            en: 'Unknown System',
          }
        }
      ],
    }, // 星系分类结束
    slugField(), // 星系别名
  ],
}

export default StarSystems
