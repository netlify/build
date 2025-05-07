import module1 from '@netlify/imaginary-module-one'
import module3 from '@netlify/imaginary-module-three'
import module2 from '@netlify/imaginary-module-two'

export const handler = () => [module1, module2, module3]
