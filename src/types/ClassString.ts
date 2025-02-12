import type { TypeBrand } from "+types/TypeBrand"
import { clsx } from "clsx/lite"

export type ClassString = ClassStringBrand & ClassValue
type ClassValue = string | false | null | undefined

type NonClassValue<Class extends ClassValue> = Class extends ClassStringBrand
	? "Expected the `class` prop to be the last argument"
	: NormalisedClassValue<Class>

type NormalisedClassValue<Class extends ClassValue> = Class extends ""
	? "Unexpected empty `class` string"
	: Class extends ` ${string}`
		? "Unexpected leading whitespace in the `class` string"
		: Class extends `${string} `
			? "Unexpected trailing whitespace in the `class` string"
			: Class extends `${string}  ${string}`
				? "Unexpected multiple consecutive whitespace in the `class` string"
				: Class

/**
 * The type brand ensures that the `class` prop always appears as the last argument to the `cn()` function.
 */
type ClassStringBrand = TypeBrand<"ClassString">

/**
 * Combines the given class strings to a single string, excluding falsy values.
 *
 * To ensure consistency, `props.class` must be the last argument if provided.
 */
export function cn<Class1 extends ClassValue>(
	class1: [Class1] extends [string] // Disallow string literals unless combined with a conditional expression.
		? string extends Class1
			? Class1
			: "Redundant call to the `cn()` function"
		: Class1,
): string
export function cn<Class1 extends ClassValue, Class2 extends ClassValue>(
	class1: NonClassValue<Class1>,
	class2: NormalisedClassValue<Class2>,
): string
export function cn<
	Class1 extends ClassValue,
	Class2 extends ClassValue,
	Class3 extends ClassValue,
>(
	class1: NonClassValue<Class1>,
	class2: NonClassValue<Class2>,
	class3: NormalisedClassValue<Class3>,
): string
export function cn<
	Class1 extends ClassValue,
	Class2 extends ClassValue,
	Class3 extends ClassValue,
	Class4 extends ClassValue,
>(
	class1: NonClassValue<Class1>,
	class2: NonClassValue<Class2>,
	class3: NonClassValue<Class3>,
	class4: NormalisedClassValue<Class4>,
): string
export function cn<
	Class1 extends ClassValue,
	Class2 extends ClassValue,
	Class3 extends ClassValue,
	Class4 extends ClassValue,
	Class5 extends ClassValue,
>(
	class1: NonClassValue<Class1>,
	class2: NonClassValue<Class2>,
	class3: NonClassValue<Class3>,
	class4: NonClassValue<Class4>,
	class5: NormalisedClassValue<Class5>,
): string
export function cn<
	Class1 extends ClassValue,
	Class2 extends ClassValue,
	Class3 extends ClassValue,
	Class4 extends ClassValue,
	Class5 extends ClassValue,
	Class6 extends ClassValue,
>(
	class1: NonClassValue<Class1>,
	class2: NonClassValue<Class2>,
	class3: NonClassValue<Class3>,
	class4: NonClassValue<Class4>,
	class5: NonClassValue<Class5>,
	class6: NormalisedClassValue<Class6>,
): string
export function cn<
	Class1 extends ClassValue,
	Class2 extends ClassValue,
	Class3 extends ClassValue,
	Class4 extends ClassValue,
	Class5 extends ClassValue,
	Class6 extends ClassValue,
	Class7 extends ClassValue,
>(
	class1: NonClassValue<Class1>,
	class2: NonClassValue<Class2>,
	class3: NonClassValue<Class3>,
	class4: NonClassValue<Class4>,
	class5: NonClassValue<Class5>,
	class6: NonClassValue<Class6>,
	class7: NormalisedClassValue<Class7>,
): string
export function cn<
	Class1 extends ClassValue,
	Class2 extends ClassValue,
	Class3 extends ClassValue,
	Class4 extends ClassValue,
	Class5 extends ClassValue,
	Class6 extends ClassValue,
	Class7 extends ClassValue,
	Class8 extends ClassValue,
>(
	class1: NonClassValue<Class1>,
	class2: NonClassValue<Class2>,
	class3: NonClassValue<Class3>,
	class4: NonClassValue<Class4>,
	class5: NonClassValue<Class5>,
	class6: NonClassValue<Class6>,
	class7: NonClassValue<Class7>,
	class8: NormalisedClassValue<Class8>,
): string
export function cn<
	Class1 extends ClassValue,
	Class2 extends ClassValue,
	Class3 extends ClassValue,
	Class4 extends ClassValue,
	Class5 extends ClassValue,
	Class6 extends ClassValue,
	Class7 extends ClassValue,
	Class8 extends ClassValue,
	Class9 extends ClassValue,
>(
	class1: NonClassValue<Class1>,
	class2: NonClassValue<Class2>,
	class3: NonClassValue<Class3>,
	class4: NonClassValue<Class4>,
	class5: NonClassValue<Class5>,
	class6: NonClassValue<Class6>,
	class7: NonClassValue<Class7>,
	class8: NonClassValue<Class8>,
	class9: NormalisedClassValue<Class9>,
): string
export function cn<
	Class1 extends ClassValue,
	Class2 extends ClassValue,
	Class3 extends ClassValue,
	Class4 extends ClassValue,
	Class5 extends ClassValue,
	Class6 extends ClassValue,
	Class7 extends ClassValue,
	Class8 extends ClassValue,
	Class9 extends ClassValue,
	Class10 extends ClassValue,
>(
	class1: NonClassValue<Class1>,
	class2: NonClassValue<Class2>,
	class3: NonClassValue<Class3>,
	class4: NonClassValue<Class4>,
	class5: NonClassValue<Class5>,
	class6: NonClassValue<Class6>,
	class7: NonClassValue<Class7>,
	class8: NonClassValue<Class8>,
	class9: NonClassValue<Class9>,
	class10: NormalisedClassValue<Class10>,
): string
export function cn<
	Class1 extends ClassValue,
	Class2 extends ClassValue,
	Class3 extends ClassValue,
	Class4 extends ClassValue,
	Class5 extends ClassValue,
	Class6 extends ClassValue,
	Class7 extends ClassValue,
	Class8 extends ClassValue,
	Class9 extends ClassValue,
	Class10 extends ClassValue,
	Class11 extends ClassValue,
>(
	class1: NonClassValue<Class1>,
	class2: NonClassValue<Class2>,
	class3: NonClassValue<Class3>,
	class4: NonClassValue<Class4>,
	class5: NonClassValue<Class5>,
	class6: NonClassValue<Class6>,
	class7: NonClassValue<Class7>,
	class8: NonClassValue<Class8>,
	class9: NonClassValue<Class9>,
	class10: NonClassValue<Class10>,
	class11: NormalisedClassValue<Class11>,
): string
export function cn<
	Class1 extends ClassValue,
	Class2 extends ClassValue,
	Class3 extends ClassValue,
	Class4 extends ClassValue,
	Class5 extends ClassValue,
	Class6 extends ClassValue,
	Class7 extends ClassValue,
	Class8 extends ClassValue,
	Class9 extends ClassValue,
	Class10 extends ClassValue,
	Class11 extends ClassValue,
	Class12 extends ClassValue,
>(
	class1: NonClassValue<Class1>,
	class2: NonClassValue<Class2>,
	class3: NonClassValue<Class3>,
	class4: NonClassValue<Class4>,
	class5: NonClassValue<Class5>,
	class6: NonClassValue<Class6>,
	class7: NonClassValue<Class7>,
	class8: NonClassValue<Class8>,
	class9: NonClassValue<Class9>,
	class10: NonClassValue<Class10>,
	class11: NonClassValue<Class11>,
	class12: NormalisedClassValue<Class12>,
): string
export function cn(...classValues: Array<ClassValue>): string {
	return clsx(...classValues)
}

/**
 * Returns the class strings associated with the given key.
 */
export function cx<Key extends number | string | symbol>(
	key: Key,
): (classValuesByKey: Record<Key, ClassValue>) => ClassValue {
	return (classValuesByKey): ClassValue => classValuesByKey[key]
}
